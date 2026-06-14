const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'namal_fyp_secret_key_2026';

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    let targetUsername = username.toLowerCase().trim();
    let targetPassword = password;

    // Map frontend demo accounts to actual database seed users
    if (targetUsername === 'student' && password === 'student123') {
        targetUsername = 'ali.raza';
        targetPassword = 'hash_raza_2026';
    } else if (targetUsername === 'faculty' && password === 'faculty123') {
        targetUsername = 'ayesha.siddiqua';
        targetPassword = 'hash_ayesha_prof';
    } else if (targetUsername === 'coordinator' && password === 'coordinator123') {
        targetUsername = 'muhammad.imran';
        targetPassword = 'hash_imran_prof';
    } else if (targetUsername === 'superadmin' && password === 'superadmin123') {
        // already matches DB username / plain-text password
    }

    try {
        // Find user account
        const [users] = await pool.query(
            'SELECT * FROM user_account WHERE Username = ? AND Status = "Active"',
            [targetUsername]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const userAccount = users[0];

        // Verify password (supports plain text for seed data and bcrypt for new users)
        let isMatch = false;
        if (userAccount.Password === targetPassword) {
            isMatch = true;
        } else {
            try {
                isMatch = bcrypt.compareSync(targetPassword, userAccount.Password);
            } catch (e) {
                isMatch = false;
            }
        }

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const personId = userAccount.PersonID;

        // Get person info
        const [persons] = await pool.query('SELECT * FROM person WHERE PersonID = ?', [personId]);
        if (persons.length === 0) {
            return res.status(404).json({ message: 'Person record not found' });
        }
        const person = persons[0];

        // Determine user roles
        // 1. Check database roles from useraccount_role and role
        const [roles] = await pool.query(
            `SELECT r.RoleName FROM useraccount_role uar 
             JOIN role r ON uar.RoleID = r.RoleID 
             WHERE uar.AccountID = ?`,
            [userAccount.AccountID]
        );

        const dbRoles = roles.map(r => r.RoleName);

        // 2. Check if person is an evaluator
        const [evals] = await pool.query('SELECT * FROM evaluators WHERE PersonID = ?', [personId]);
        const isEvaluator = evals.length > 0;

        // Determine active role based on username or role assignment
        let activeRole = 'student'; // fallback
        if (username === 'student') activeRole = 'student';
        else if (username === 'faculty') activeRole = 'faculty';
        else if (username === 'evaluator') activeRole = 'evaluator';
        else if (username === 'coordinator') activeRole = 'coordinator';
        else if (username === 'superadmin') activeRole = 'superadmin';
        else if (dbRoles.includes('SuperAdmin')) activeRole = 'superadmin';
        else if (isEvaluator) activeRole = 'evaluator';
        else if (dbRoles.includes('Coordinator')) activeRole = 'coordinator';
        else if (dbRoles.includes('Faculty')) activeRole = 'faculty';
        else if (dbRoles.includes('Student')) activeRole = 'student';

        // Get subtitle and details based on role
        let subtitle = 'User';
        if (activeRole === 'student') {
            const [students] = await pool.query('SELECT RegistrationNo FROM student WHERE StudentID = ?', [personId]);
            subtitle = students.length > 0 ? students[0].RegistrationNo : 'Student';
        } else if (activeRole === 'faculty') {
            const [faculties] = await pool.query('SELECT Designation FROM faculty WHERE FacultyID = ?', [personId]);
            subtitle = faculties.length > 0 ? faculties[0].Designation : 'Faculty Member';
        } else if (activeRole === 'coordinator') {
            subtitle = 'FYP Coordinator';
        } else if (activeRole === 'evaluator') {
            const [evalDetails] = await pool.query('SELECT EvaluatorType FROM evaluators WHERE PersonID = ?', [personId]);
            const type = evalDetails.length > 0 ? evalDetails[0].EvaluatorType : 'Internal';
            subtitle = `${type} Evaluator`;
        } else if (activeRole === 'superadmin') {
            subtitle = 'Super Administrator';
        }

        const fullName = `${person.FirstName} ${person.LastName || ''}`.trim();
        const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D9488&color=fff&bold=true`;

        // Generate JWT
        const token = jwt.sign(
            {
                accountId: userAccount.AccountID,
                personId: personId,
                username: userAccount.Username,
                role: activeRole
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                username: userAccount.Username,
                role: activeRole,
                name: fullName,
                subtitle,
                avatar
            }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const { personId, username, role } = req.user;

        const [persons] = await pool.query('SELECT * FROM person WHERE PersonID = ?', [personId]);
        if (persons.length === 0) {
            return res.status(404).json({ message: 'User profile not found' });
        }
        const person = persons[0];

        let subtitle = 'User';
        if (role === 'student') {
            const [students] = await pool.query('SELECT RegistrationNo FROM student WHERE StudentID = ?', [personId]);
            subtitle = students.length > 0 ? students[0].RegistrationNo : 'Student';
        } else if (role === 'faculty') {
            const [faculties] = await pool.query('SELECT Designation FROM faculty WHERE FacultyID = ?', [personId]);
            subtitle = faculties.length > 0 ? faculties[0].Designation : 'Faculty Member';
        } else if (role === 'coordinator') {
            subtitle = 'FYP Coordinator';
        } else if (role === 'evaluator') {
            const [evalDetails] = await pool.query('SELECT EvaluatorType FROM evaluators WHERE PersonID = ?', [personId]);
            const type = evalDetails.length > 0 ? evalDetails[0].EvaluatorType : 'Internal';
            subtitle = `${type} Evaluator`;
        } else if (role === 'superadmin') {
            subtitle = 'Super Administrator';
        }

        const fullName = `${person.FirstName} ${person.LastName || ''}`.trim();
        const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D9488&color=fff&bold=true`;

        res.json({
            username,
            role,
            name: fullName,
            subtitle,
            avatar,
            personId
        });
    } catch (err) {
        console.error('GetMe Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
