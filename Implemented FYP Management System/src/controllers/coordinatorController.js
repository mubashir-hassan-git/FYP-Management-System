const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// ==================== STUDENT MANAGEMENT ====================

// List all students
exports.listStudents = async (req, res) => {
    try {
        const [students] = await pool.query(
            `SELECT s.*, p.FirstName, p.LastName, p.Email, p.CNIC, p.Gender, p.DOB, b.BatchName, g.GroupName 
             FROM student s 
             JOIN person p ON s.StudentID = p.PersonID 
             JOIN batch b ON s.BatchID = b.BatchID 
             LEFT JOIN \`groups\` g ON s.GroupID = g.GroupID`
        );
        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Search students
exports.searchStudents = async (req, res) => {
    const { q } = req.query;
    try {
        const [students] = await pool.query(
            `SELECT s.*, p.FirstName, p.LastName, p.Email, p.CNIC, b.BatchName, g.GroupName 
             FROM student s 
             JOIN person p ON s.StudentID = p.PersonID 
             JOIN batch b ON s.BatchID = b.BatchID 
             LEFT JOIN \`groups\` g ON s.GroupID = g.GroupID 
             WHERE p.FirstName LIKE ? OR p.LastName LIKE ? OR s.RegistrationNo LIKE ? OR p.CNIC LIKE ?`,
            [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]
        );
        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add Student
exports.addStudent = async (req, res) => {
    const { firstName, lastName, email, cnic, gender, dob, registrationNo, batchId } = req.body;

    if (!firstName || !email || !cnic || !registrationNo || !batchId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Insert into person
        const [pResult] = await conn.query(
            `INSERT INTO person (FirstName, LastName, Email, CNIC, Gender, DOB, PersonType) 
             VALUES (?, ?, ?, ?, ?, ?, 'Student')`,
            [firstName, lastName, email, cnic, gender, dob]
        );
        const personId = pResult.insertId;

        // 2. Insert into student
        await conn.query(
            `INSERT INTO student (StudentID, RegistrationNo, BatchID, GroupID) 
             VALUES (?, ?, ?, NULL)`,
            [personId, registrationNo, batchId]
        );

        // 3. Create default user account
        const username = email.split('@')[0].toLowerCase();
        const hashedPassword = bcrypt.hashSync('student123', 10);
        const [accResult] = await conn.query(
            `INSERT INTO user_account (Username, Password, Status, PersonID) 
             VALUES (?, ?, 'Active', ?)`,
            [username, hashedPassword, personId]
        );
        const accountId = accResult.insertId;

        // 4. Assign role
        await conn.query(
            'INSERT INTO useraccount_role (AccountID, RoleID) VALUES (?, 1)',
            [accountId]
        );

        await conn.commit();
        res.status(201).json({ message: 'Student created successfully', studentId: personId });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: err.message || 'Internal server error' });
    } finally {
        conn.release();
    }
};

// Update Student
exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, cnic, gender, dob, registrationNo, batchId, groupId } = req.body;

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Update person
        await conn.query(
            `UPDATE person SET FirstName = ?, LastName = ?, Email = ?, CNIC = ?, Gender = ?, DOB = ? 
             WHERE PersonID = ?`,
            [firstName, lastName, email, cnic, gender, dob, id]
        );

        // Update student
        await conn.query(
            `UPDATE student SET RegistrationNo = ?, BatchID = ?, GroupID = ? 
             WHERE StudentID = ?`,
            [registrationNo, batchId, groupId || null, id]
        );

        await conn.commit();
        res.json({ message: 'Student updated successfully' });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        conn.release();
    }
};

// Delete Student
exports.deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        // Person deletion cascade-deletes user_account and student tables due to foreign keys
        const [result] = await pool.query('DELETE FROM person WHERE PersonID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// ==================== FACULTY MANAGEMENT ====================

// List all faculty
exports.listFaculty = async (req, res) => {
    try {
        const [faculty] = await pool.query(
            `SELECT f.*, p.FirstName, p.LastName, p.Email, p.CNIC, p.Gender, d.DepartmentName 
             FROM faculty f 
             JOIN person p ON f.FacultyID = p.PersonID 
             JOIN department d ON f.DepartmentID = d.DepartmentID`
        );
        res.json(faculty);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add Faculty
exports.addFaculty = async (req, res) => {
    const { firstName, lastName, email, cnic, gender, dob, employeeNo, designation, departmentId } = req.body;

    if (!firstName || !email || !cnic || !employeeNo || !departmentId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Insert into person
        const [pResult] = await conn.query(
            `INSERT INTO person (FirstName, LastName, Email, CNIC, Gender, DOB, PersonType) 
             VALUES (?, ?, ?, ?, ?, ?, 'Faculty')`,
            [firstName, lastName, email, cnic, gender, dob]
        );
        const personId = pResult.insertId;

        // 2. Insert into faculty
        await conn.query(
            `INSERT INTO faculty (FacultyID, EmployeeNo, Designation, DepartmentID) 
             VALUES (?, ?, ?, ?)`,
            [personId, employeeNo, designation, departmentId]
        );

        // 3. Create default user account
        const username = email.split('@')[0].toLowerCase();
        const hashedPassword = bcrypt.hashSync('faculty123', 10);
        const [accResult] = await conn.query(
            `INSERT INTO user_account (Username, Password, Status, PersonID) 
             VALUES (?, ?, 'Active', ?)`,
            [username, hashedPassword, personId]
        );
        const accountId = accResult.insertId;

        // 4. Assign role
        await conn.query(
            'INSERT INTO useraccount_role (AccountID, RoleID) VALUES (?, 2)',
            [accountId]
        );

        await conn.commit();
        res.status(201).json({ message: 'Faculty created successfully', facultyId: personId });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: err.message || 'Internal server error' });
    } finally {
        conn.release();
    }
};

// Update Faculty
exports.updateFaculty = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, cnic, gender, dob, employeeNo, designation, departmentId } = req.body;

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Update person
        await conn.query(
            `UPDATE person SET FirstName = ?, LastName = ?, Email = ?, CNIC = ?, Gender = ?, DOB = ? 
             WHERE PersonID = ?`,
            [firstName, lastName, email, cnic, gender, dob, id]
        );

        // Update faculty
        await conn.query(
            `UPDATE faculty SET EmployeeNo = ?, Designation = ?, DepartmentID = ? 
             WHERE FacultyID = ?`,
            [employeeNo, designation, departmentId, id]
        );

        await conn.commit();
        res.json({ message: 'Faculty updated successfully' });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        conn.release();
    }
};

// Delete Faculty
exports.deleteFaculty = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM person WHERE PersonID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Faculty not found' });
        }
        res.json({ message: 'Faculty deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// ==================== GROUP MANAGEMENT ====================

// List all groups
exports.listGroups = async (req, res) => {
    try {
        const [groups] = await pool.query(
            `SELECT g.*, p.Title AS ProjectTitle 
             FROM \`groups\` g 
             LEFT JOIN project p ON g.ProjectID = p.ProjectID`
        );

        const result = [];
        for (const g of groups) {
            // Get student members
            const [students] = await pool.query(
                `SELECT s.StudentID, s.RegistrationNo, per.FirstName, per.LastName 
                 FROM student s 
                 JOIN person per ON s.StudentID = per.PersonID 
                 WHERE s.GroupID = ?`,
                [g.GroupID]
            );

            result.push({
                groupId: g.GroupID,
                groupName: g.GroupName,
                projectTitle: g.ProjectTitle || 'Unassigned',
                students: students.map(s => `${s.FirstName} ${s.LastName || ''} (${s.RegistrationNo})`)
            });
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create Group with exact validation of 2 students
exports.createGroup = async (req, res) => {
    const { groupName, studentId1, studentId2 } = req.body;
    const coordinatorId = req.user.personId;

    if (!groupName || !studentId1 || !studentId2) {
        return res.status(400).json({ message: 'GroupName, Student 1 and Student 2 are required' });
    }

    if (studentId1 === studentId2) {
        return res.status(400).json({ message: 'A group must contain exactly 2 distinct students' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Check validation: Are students already grouped?
        const [groupedStudents] = await conn.query(
            'SELECT StudentID, GroupID FROM student WHERE StudentID IN (?, ?) AND GroupID IS NOT NULL',
            [studentId1, studentId2]
        );

        if (groupedStudents.length > 0) {
            const ids = groupedStudents.map(s => s.StudentID).join(', ');
            return res.status(400).json({ message: `Student(s) with ID(s) ${ids} are already assigned to a group` });
        }

        // Create group
        const [gResult] = await conn.query(
            'INSERT INTO `groups` (GroupName, CoordinatorID, ProjectID) VALUES (?, ?, NULL)',
            [groupName, coordinatorId]
        );
        const groupId = gResult.insertId;

        // Assign students to this group
        await conn.query(
            'UPDATE student SET GroupID = ? WHERE StudentID IN (?, ?)',
            [groupId, studentId1, studentId2]
        );

        await conn.commit();
        res.status(201).json({ message: 'Group created successfully', groupId });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        conn.release();
    }
};

// Delete Group
exports.deleteGroup = async (req, res) => {
    const { id } = req.params;
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Remove group assignments from students
        await conn.query('UPDATE student SET GroupID = NULL WHERE GroupID = ?', [id]);

        // 2. Delete the group
        const [result] = await conn.query('DELETE FROM `groups` WHERE GroupID = ?', [id]);

        if (result.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ message: 'Group not found' });
        }

        await conn.commit();
        res.json({ message: 'Group deleted successfully' });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        conn.release();
    }
};


// ==================== PROJECT MANAGEMENT ====================

// List all projects
exports.listProjects = async (req, res) => {
    try {
        const [projects] = await pool.query(
            `SELECT p.*, g.GroupName, g.GroupID, 
                    GROUP_CONCAT(CONCAT(fs.FirstName, ' ', IFNULL(fs.LastName, ''), ' (', ps.Role, ')') SEPARATOR ', ') AS supervisors
             FROM project p 
             LEFT JOIN \`groups\` g ON p.ProjectID = g.ProjectID 
             LEFT JOIN project_supervision ps ON p.ProjectID = ps.ProjectID 
             LEFT JOIN faculty f ON ps.FacultyID = f.FacultyID 
             LEFT JOIN person fs ON f.FacultyID = fs.PersonID 
             GROUP BY p.ProjectID`
        );
        res.json(projects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create Project
exports.createProject = async (req, res) => {
    const { title, description, domain } = req.body;

    if (!title || !domain) {
        return res.status(400).json({ message: 'Title and Domain are required' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO project (Title, Description, Domain, ProjectStatus) VALUES (?, ?, ?, "Proposal")',
            [title, description || '', domain]
        );
        res.status(201).json({ message: 'Project created successfully', projectId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Assign Project to Group
exports.assignProject = async (req, res) => {
    const { projectId, groupId } = req.body;

    if (!projectId || !groupId) {
        return res.status(400).json({ message: 'ProjectID and GroupID are required' });
    }

    try {
        await pool.query(
            'UPDATE `groups` SET ProjectID = ? WHERE GroupID = ?',
            [projectId, groupId]
        );
        await pool.query(
            'UPDATE project SET ProjectStatus = "Active" WHERE ProjectID = ?',
            [projectId]
        );
        res.json({ message: 'Project assigned successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Project Status
exports.updateProjectStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE project SET ProjectStatus = ? WHERE ProjectID = ?',
            [status, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json({ message: 'Project status updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete Project
exports.deleteProject = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM project WHERE ProjectID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// ==================== SUPERVISOR ASSIGNMENT ====================

// Assign Supervisors — validates supervisor ≠ co-supervisor and neither can hold both roles on same project
exports.assignSupervisors = async (req, res) => {
    const { projectId, supervisorId, coSupervisorId } = req.body;

    if (!projectId || !supervisorId) {
        return res.status(400).json({ message: 'ProjectID and SupervisorID are required' });
    }

    if (coSupervisorId && String(supervisorId) === String(coSupervisorId)) {
        return res.status(400).json({ message: 'Supervisor and Co-Supervisor cannot be the same person' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Delete existing supervisors for this project
        await conn.query('DELETE FROM project_supervision WHERE ProjectID = ?', [projectId]);

        // Insert Supervisor
        await conn.query(
            'INSERT INTO project_supervision (ProjectID, FacultyID, Role) VALUES (?, ?, "Supervisor")',
            [projectId, supervisorId]
        );

        // Insert Co-Supervisor if provided and different
        if (coSupervisorId && String(coSupervisorId) !== '' && String(supervisorId) !== String(coSupervisorId)) {
            await conn.query(
                'INSERT INTO project_supervision (ProjectID, FacultyID, Role) VALUES (?, ?, "Co-Supervisor")',
                [projectId, coSupervisorId]
            );
        }

        await conn.commit();
        res.json({ message: 'Supervisors assigned successfully' });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        conn.release();
    }
};


// ==================== MILESTONE MANAGEMENT ====================

// Create Milestone
exports.createMilestone = async (req, res) => {
    const { batchId, title, description, dueDate, weightage, status } = req.body;

    if (!batchId || !title || !dueDate || !weightage) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO milestone (BatchID, Title, Description, DueDate, Weightage, Status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [batchId, title, description || '', dueDate, weightage, status || 'Active']
        );
        res.status(201).json({ message: 'Milestone created successfully', milestoneId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Milestone
exports.updateMilestone = async (req, res) => {
    const { id } = req.params;
    const { title, description, dueDate, weightage, status } = req.body;

    try {
        const [result] = await pool.query(
            `UPDATE milestone SET Title = ?, Description = ?, DueDate = ?, Weightage = ?, Status = ? 
             WHERE MilestoneID = ?`,
            [title, description, dueDate, weightage, status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Milestone not found' });
        }
        res.json({ message: 'Milestone updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete Milestone (cascades evaluations, submissions, criteria, results)
exports.deleteMilestone = async (req, res) => {
    const { id } = req.params;
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Delete evaluation results linked to this milestone's evaluations
        await conn.query(
            `DELETE er FROM evaluation_result er
             JOIN evaluation e ON er.EvaluationID = e.EvaluationID
             WHERE e.MilestoneID = ?`, [id]
        );
        // 2. Delete evaluation criteria linked to this milestone's evaluations
        await conn.query(
            `DELETE ec FROM evaluation_criteria ec
             JOIN evaluation e ON ec.EvaluationID = e.EvaluationID
             WHERE e.MilestoneID = ?`, [id]
        );
        // 3. Delete evaluation assignments linked to this milestone's evaluations
        await conn.query(
            `DELETE ea FROM evaluation_assignment ea
             JOIN evaluation e ON ea.EvaluationID = e.EvaluationID
             WHERE e.MilestoneID = ?`, [id]
        );
        // 4. Delete evaluations for this milestone
        await conn.query('DELETE FROM evaluation WHERE MilestoneID = ?', [id]);

        // 5. Delete submission files linked to submissions of this milestone
        await conn.query(
            `DELETE sf FROM submission_file sf
             JOIN submission s ON sf.SubmissionID = s.SubmissionID
             WHERE s.MilestoneID = ?`, [id]
        );
        // 6. Delete feedback linked to submissions of this milestone
        await conn.query(
            `DELETE f FROM feedback f
             JOIN submission s ON f.SubmissionID = s.SubmissionID
             WHERE s.MilestoneID = ?`, [id]
        );
        // 7. Delete submissions for this milestone
        await conn.query('DELETE FROM submission WHERE MilestoneID = ?', [id]);

        // 8. Finally delete the milestone
        const [result] = await conn.query('DELETE FROM milestone WHERE MilestoneID = ?', [id]);
        if (result.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ message: 'Milestone not found' });
        }

        await conn.commit();
        res.json({ message: 'Milestone and all related data deleted successfully' });
    } catch (err) {
        await conn.rollback();
        console.error('Delete milestone error:', err);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        conn.release();
    }
};

// List all batches
exports.listBatches = async (req, res) => {
    try {
        const [batches] = await pool.query('SELECT * FROM batch ORDER BY BatchName');
        res.json(batches);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// List all departments
exports.listDepartments = async (req, res) => {
    try {
        const [departments] = await pool.query('SELECT * FROM department ORDER BY DepartmentName');
        res.json(departments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Coordinator dashboard statistics and lists
exports.getDashboardStats = async (req, res) => {
    try {
        const [[{ count: totalStudents }]] = await pool.query('SELECT COUNT(*) AS count FROM student');
        const [[{ count: totalFaculty }]] = await pool.query('SELECT COUNT(*) AS count FROM faculty');
        const [[{ count: totalGroups }]] = await pool.query('SELECT COUNT(*) AS count FROM `groups`');
        const [[{ count: totalProjects }]] = await pool.query('SELECT COUNT(*) AS count FROM project');

        const [domainDistribution] = await pool.query(
            'SELECT Domain, COUNT(*) AS count FROM project GROUP BY Domain'
        );

        const [facultyLoad] = await pool.query(
            `SELECT CONCAT(per.FirstName, ' ', IFNULL(per.LastName, '')) AS FacultyName,
                    COUNT(ps.ProjectID) AS count
             FROM faculty f
             JOIN person per ON f.FacultyID = per.PersonID
             LEFT JOIN project_supervision ps ON f.FacultyID = ps.FacultyID AND ps.Role = 'Supervisor'
             GROUP BY f.FacultyID`
        );

        const [recentActivity] = await pool.query(
            `SELECT s.SubmissionID, sf.FileName, g.GroupName, m.Title AS MilestoneTitle, s.SubmissionVersion 
             FROM submission s 
             JOIN project p ON s.ProjectID = p.ProjectID 
             JOIN \`groups\` g ON p.ProjectID = g.ProjectID 
             JOIN milestone m ON s.MilestoneID = m.MilestoneID 
             LEFT JOIN submission_file sf ON s.SubmissionID = sf.SubmissionID 
             ORDER BY s.SubmissionID DESC 
             LIMIT 5`
        );

        res.json({
            stats: {
                students: totalStudents,
                faculty: totalFaculty,
                groups: totalGroups,
                projects: totalProjects
            },
            domains: domainDistribution,
            facultyLoad: facultyLoad,
            recentActivity: recentActivity
        });
    } catch (err) {
        console.error('Error fetching coordinator dashboard stats:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// List all milestones (for Coordinator)
exports.listMilestones = async (req, res) => {
    try {
        const [milestones] = await pool.query(
            `SELECT m.*, b.BatchName 
             FROM milestone m 
             JOIN batch b ON m.BatchID = b.BatchID 
             ORDER BY b.BatchName, m.DueDate ASC`
        );
        res.json(milestones);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
