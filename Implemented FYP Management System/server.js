const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const pool = require('./src/config/db');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const facultyRoutes = require('./src/routes/facultyRoutes');
const coordinatorRoutes = require('./src/routes/coordinatorRoutes');
const evaluatorRoutes = require('./src/routes/evaluatorRoutes');
const submissionRoutes = require('./src/routes/submissionRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const superAdminRoutes = require('./src/routes/superAdminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '.')));
// Expose upload directory statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes); // student dashboards
app.use('/api/faculty', facultyRoutes);   // faculty dashboards
app.use('/api/submissions', submissionRoutes);
app.use('/api/evaluations', evaluatorRoutes);
app.use('/api/reports', reportRoutes);

// Mount coordinator CRUD routes
app.use('/api', coordinatorRoutes);

// Mount super admin + shared profile routes
app.use('/api', superAdminRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.message);
    res.status(500).json({ message: err.message || 'Internal server error' });
});

// Seeding function
async function seedDemoUsers() {
    console.log('Checking and seeding demo user accounts...');
    const demoUsers = [
        { username: 'superadmin',  password: 'superadmin123',  personId: 1,  roleId: 4 },
        { username: 'faculty',     password: 'faculty123',     personId: 3,  roleId: 2 },  // ayesha.siddiqua
        { username: 'evaluator',   password: 'evaluator123',   personId: 3,  roleId: 2 },  // Internal Evaluator shares faculty
        { username: 'coordinator', password: 'coordinator123', personId: 2,  roleId: 3 }   // muhammad.imran
    ];

    const conn = await pool.getConnection();
    try {
        for (const u of demoUsers) {
            // Check if user already exists (by Username or PersonID)
            const [existing] = await conn.query('SELECT AccountID FROM user_account WHERE Username = ? OR PersonID = ?', [u.username, u.personId]);
            if (existing.length === 0) {
                // Check if person exists
                const [personExists] = await conn.query('SELECT PersonID FROM person WHERE PersonID = ?', [u.personId]);
                if (personExists.length > 0) {
                    await conn.beginTransaction();

                    const hash = bcrypt.hashSync(u.password, 10);
                    const [accResult] = await conn.query(
                        'INSERT INTO user_account (Username, Password, Status, PersonID) VALUES (?, ?, "Active", ?)',
                        [u.username, hash, u.personId]
                    );
                    const accountId = accResult.insertId;

                    await conn.query(
                        'INSERT INTO useraccount_role (AccountID, RoleID) VALUES (?, ?)',
                        [accountId, u.roleId]
                    );

                    // If evaluator, ensure they also have the entry in evaluators table (which they do in fyb_db seed data)
                    await conn.commit();
                    console.log(`Seeded demo user: ${u.username}`);
                } else {
                    console.log(`Skipping seed for ${u.username}: PersonID ${u.personId} does not exist in person table`);
                }
            }
        }
    } catch (err) {
        await conn.rollback();
        console.error('Error seeding demo users:', err);
    } finally {
        conn.release();
    }
}

// Start Server
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    try {
        // Test DB connection
        const conn = await pool.getConnection();
        console.log('Database connection pool established successfully.');
        conn.release();

        // Run seed
        await seedDemoUsers();
    } catch (e) {
        console.error('DATABASE CONNECTION ERROR:', e.message);
    }
});
