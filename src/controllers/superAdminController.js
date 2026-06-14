const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// ============================================================
// SYSTEM STATISTICS
// ============================================================

exports.getSystemStats = async (req, res) => {
    try {
        const [results] = await pool.query('CALL sp_system_stats()');
        const stats = Array.isArray(results[0]) ? results[0][0] : results[0];
        res.json({ stats, recentLogs: [] });
    } catch (err) {
        console.error('System stats error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ============================================================
// USER ACCOUNT MANAGEMENT (Access Control)
// ============================================================

// List all user accounts with person and role info
exports.listAllAccounts = async (req, res) => {
    try {
        const [accounts] = await pool.query(
            `SELECT ua.AccountID, ua.Username, ua.Status, ua.CreatedAt, ua.LastLogin,
                    p.PersonID, p.FirstName, p.LastName, p.Email, p.PersonType,
                    GROUP_CONCAT(r.RoleName ORDER BY r.RoleName SEPARATOR ', ') AS Roles
             FROM user_account ua
             JOIN person p ON ua.PersonID = p.PersonID
             LEFT JOIN useraccount_role uar ON ua.AccountID = uar.AccountID
             LEFT JOIN role r ON uar.RoleID = r.RoleID
             GROUP BY ua.AccountID
             ORDER BY ua.CreatedAt DESC`
        );
        res.json(accounts);
    } catch (err) {
        console.error('List accounts error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get single account detail
exports.getAccount = async (req, res) => {
    const { id } = req.params;
    try {
        const [accounts] = await pool.query(
            `SELECT ua.AccountID, ua.Username, ua.Status, ua.CreatedAt, ua.LastLogin,
                    p.PersonID, p.FirstName, p.LastName, p.Email, p.CNIC, p.Gender, p.DOB, p.PersonType,
                    GROUP_CONCAT(r.RoleName SEPARATOR ', ') AS Roles
             FROM user_account ua
             JOIN person p ON ua.PersonID = p.PersonID
             LEFT JOIN useraccount_role uar ON ua.AccountID = uar.AccountID
             LEFT JOIN role r ON uar.RoleID = r.RoleID
             WHERE ua.AccountID = ?
             GROUP BY ua.AccountID`,
            [id]
        );
        if (accounts.length === 0) return res.status(404).json({ message: 'Account not found' });
        res.json(accounts[0]);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Toggle account status: Active / Suspended / Inactive
exports.setAccountStatus = async (req, res) => {
    const { id } = req.params; // PersonID
    const { status } = req.body;
    const allowed = ['Active', 'Inactive', 'Suspended'];

    if (!allowed.includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Use Active, Inactive, or Suspended.' });
    }

    try {
        // sp_toggle_account_status expects PersonID
        await pool.query('CALL sp_toggle_account_status(?, ?)', [id, status]);
        res.json({ message: `Account status updated to ${status}` });
    } catch (err) {
        console.error('Set status error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Reset a user's password (admin-initiated reset)
exports.resetPassword = async (req, res) => {
    const { id } = req.params; // PersonID
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        const hashed = bcrypt.hashSync(newPassword, 10);
        // sp_change_password expects PersonID
        await pool.query('CALL sp_change_password(?, ?)', [id, hashed]);
        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update a user's role assignment
exports.updateUserRole = async (req, res) => {
    const { id } = req.params; // accountId
    const { roleId } = req.body;

    if (!roleId) return res.status(400).json({ message: 'roleId is required' });

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        // Remove existing roles first
        await conn.query('DELETE FROM useraccount_role WHERE AccountID = ?', [id]);
        // Assign new role
        await conn.query('INSERT INTO useraccount_role (AccountID, RoleID) VALUES (?, ?)', [id, roleId]);
        await conn.commit();
        res.json({ message: 'User role updated successfully' });
    } catch (err) {
        await conn.rollback();
        console.error('Update role error:', err);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        conn.release();
    }
};

// Create a new user account (admin creates accounts directly)
exports.createAccount = async (req, res) => {
    const { firstName, lastName, email, cnic, gender, dob, personType, username, password, roleId } = req.body;

    if (!firstName || !email || !cnic || !username || !password || !personType || !roleId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Check duplicate email/cnic/username
        const [dupEmail] = await conn.query('SELECT PersonID FROM person WHERE Email = ?', [email]);
        if (dupEmail.length > 0) {
            await conn.rollback();
            return res.status(400).json({ message: 'Email already exists' });
        }
        const [dupUser] = await conn.query('SELECT AccountID FROM user_account WHERE Username = ?', [username]);
        if (dupUser.length > 0) {
            await conn.rollback();
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Insert person
        const [pResult] = await conn.query(
            `INSERT INTO person (FirstName, LastName, Email, CNIC, Gender, DOB, PersonType)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [firstName, lastName || '', email, cnic, gender || 'Male', dob || null, personType]
        );
        const personId = pResult.insertId;

        // Insert account
        const hashed = bcrypt.hashSync(password, 10);
        const [accResult] = await conn.query(
            `INSERT INTO user_account (Username, Password, Status, PersonID) VALUES (?, ?, 'Active', ?)`,
            [username, hashed, personId]
        );
        const accountId = accResult.insertId;

        // Assign role
        await conn.query('INSERT INTO useraccount_role (AccountID, RoleID) VALUES (?, ?)', [accountId, roleId]);

        // If student, also insert into student table (requires batchId)
        if (personType === 'Student' && req.body.batchId) {
            const regNo = req.body.registrationNo || `REG-${personId}`;
            await conn.query(
                'INSERT INTO student (StudentID, RegistrationNo, BatchID) VALUES (?, ?, ?)',
                [personId, regNo, req.body.batchId]
            );
        }

        // If faculty, also insert into faculty table
        if (personType === 'Faculty' && req.body.departmentId) {
            await conn.query(
                'INSERT INTO faculty (FacultyID, EmployeeNo, Designation, DepartmentID) VALUES (?, ?, ?, ?)',
                [personId, req.body.employeeNo || `EMP-${personId}`, req.body.designation || 'Lecturer', req.body.departmentId]
            );
        }

        await conn.commit();
        res.status(201).json({ message: 'Account created successfully', personId, accountId });
    } catch (err) {
        await conn.rollback();
        console.error('Create account error:', err);
        res.status(500).json({ message: err.message || 'Internal server error' });
    } finally {
        conn.release();
    }
};

// Delete a user account permanently
exports.deleteAccount = async (req, res) => {
    const { id } = req.params; // personId

    // Protect super admin account
    if (parseInt(id) === 1) {
        return res.status(403).json({ message: 'Cannot delete the super admin account' });
    }

    try {
        const [result] = await pool.query('DELETE FROM person WHERE PersonID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Person not found' });
        }
        res.json({ message: 'Account and all associated data deleted successfully' });
    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update person info (admin can update any user's basic info)
exports.updateAccount = async (req, res) => {
    const { id } = req.params; // personId
    const { firstName, lastName, gender, dob, personType } = req.body;

    try {
        await pool.query(
            `UPDATE person SET FirstName = ?, LastName = ?, Gender = ?, DOB = ?, PersonType = ? WHERE PersonID = ?`,
            [firstName, lastName || '', gender || 'Male', dob || null, personType, id]
        );
        res.json({ message: 'User info updated successfully' });
    } catch (err) {
        console.error('Update account error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Audit log removed from system

// ============================================================
// PROFILE: GET + UPDATE (all roles) — email/org fields are READ-ONLY
// ============================================================

exports.getMyProfile = async (req, res) => {
    const personId = req.user.personId;
    const role = req.user.role;

    try {
        const [persons] = await pool.query('SELECT * FROM person WHERE PersonID = ?', [personId]);
        if (persons.length === 0) return res.status(404).json({ message: 'Profile not found' });

        const person = persons[0];
        let extra = {};

        if (role === 'student') {
            const [[row]] = await pool.query(
                `SELECT s.RegistrationNo, b.BatchName, b.BatchID, g.GroupName
                 FROM student s JOIN batch b ON s.BatchID=b.BatchID
                 LEFT JOIN \`groups\` g ON s.GroupID=g.GroupID
                 WHERE s.StudentID=?`, [personId]
            );
            extra = row || {};
        } else if (role === 'faculty' || role === 'coordinator') {
            const [[row]] = await pool.query(
                `SELECT f.EmployeeNo, f.Designation, d.DepartmentName
                 FROM faculty f JOIN department d ON f.DepartmentID=d.DepartmentID
                 WHERE f.FacultyID=?`, [personId]
            );
            extra = row || {};
        } else if (role === 'evaluator') {
            try {
                const [[row]] = await pool.query(
                    `SELECT EvaluatorType FROM evaluators WHERE PersonID=?`, [personId]
                );
                extra = row || {};
            } catch(e) { extra = {}; }
        }

        const [accounts] = await pool.query(
            'SELECT Username, Status, CreatedAt, LastLogin FROM user_account WHERE PersonID=?', [personId]
        );
        const account = accounts[0] || {};

        res.json({
            personId: person.PersonID,
            firstName: person.FirstName,
            lastName: person.LastName,
            email: person.Email,         // PERMANENT — shown but not editable
            cnic: person.CNIC,           // PERMANENT
            gender: person.Gender,
            dob: person.DOB,
            personType: person.PersonType,
            username: account.Username,   // PERMANENT
            accountStatus: account.Status,
            createdAt: account.CreatedAt,
            lastLogin: account.LastLogin,
            ...extra
        });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update own profile — only mutable fields (no email/cnic/username change)
exports.updateMyProfile = async (req, res) => {
    const personId = req.user.personId;
    const { firstName, lastName, gender, dob } = req.body;

    if (!firstName) return res.status(400).json({ message: 'First name is required' });

    try {
        await pool.query(
            `UPDATE person SET FirstName=?, LastName=?, Gender=?, DOB=? WHERE PersonID=?`,
            [firstName, lastName || '', gender || 'Male', dob || null, personId]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Change own password
exports.changeMyPassword = async (req, res) => {
    const personId = req.user.personId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Current password and new password (min 6 chars) are required' });
    }

    try {
        const [accounts] = await pool.query('SELECT Password FROM user_account WHERE PersonID = ?', [personId]);
        if (accounts.length === 0) return res.status(404).json({ message: 'Account not found' });

        const stored = accounts[0].Password;
        let valid = false;
        if (stored === currentPassword) {
            valid = true; // plain-text seed match
        } else {
            try { valid = bcrypt.compareSync(currentPassword, stored); } catch (e) { valid = false; }
        }

        if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

        const hashed = bcrypt.hashSync(newPassword, 10);
        await pool.query('CALL sp_change_password(?, ?)', [personId, hashed]);
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// List all roles (for dropdowns)
exports.listRoles = async (req, res) => {
    try {
        const [roles] = await pool.query('SELECT * FROM role ORDER BY RoleID');
        res.json(roles);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
