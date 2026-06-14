const pool = require('../config/db');

// Helper to get EvaluatorID from PersonID
const getEvaluatorId = async (personId) => {
    const [evals] = await pool.query('SELECT EvaluatorID FROM evaluators WHERE PersonID = ?', [personId]);
    return evals.length > 0 ? evals[0].EvaluatorID : null;
};

// Get evaluator dashboard statistics and today's schedule
exports.getDashboard = async (req, res) => {
    const personId = req.user.personId;

    try {
        const evaluatorId = await getEvaluatorId(personId);
        if (!evaluatorId) {
            return res.status(404).json({ message: 'Evaluator profile not found' });
        }

        // 1. Assigned Evaluations Count
        const [assigned] = await pool.query(
            'SELECT COUNT(*) AS count FROM evaluation_assignment WHERE EvaluatorID = ?',
            [evaluatorId]
        );
        const assignedCount = assigned[0].count;

        // 2. Completed Evaluations Count
        const [completed] = await pool.query(
            `SELECT COUNT(*) AS count 
             FROM evaluation_assignment ea 
             JOIN evaluation e ON ea.EvaluationID = e.EvaluationID 
             WHERE ea.EvaluatorID = ? AND e.Status = 'Completed'`,
            [evaluatorId]
        );
        const completedCount = completed[0].count;

        // 3. Pending Evaluations Count
        const [pending] = await pool.query(
            `SELECT COUNT(*) AS count 
             FROM evaluation_assignment ea 
             JOIN evaluation e ON ea.EvaluationID = e.EvaluationID 
             WHERE ea.EvaluatorID = ? AND e.Status = 'Scheduled'`,
            [evaluatorId]
        );
        const pendingCount = pending[0].count;

        // 3.5. Average Marks
        const [marks] = await pool.query(
            `SELECT SUM(er.ObtainedMarks) AS obt, SUM(ec.MaxMarks) AS max 
             FROM evaluation_result er
             JOIN evaluation e ON er.EvaluationID = e.EvaluationID
             JOIN evaluation_criteria ec ON er.CriteriaID = ec.CriteriaID
             JOIN evaluation_assignment ea ON e.EvaluationID = ea.EvaluationID
             WHERE ea.EvaluatorID = ? AND e.Status = 'Completed'`,
            [evaluatorId]
        );
        let averageMarks = 0;
        if (marks.length > 0 && marks[0].max > 0) {
            averageMarks = parseFloat(((marks[0].obt / marks[0].max) * 100).toFixed(1));
        }

        // 4. Assigned evaluations details
        const [evaluationsList] = await pool.query(
            `SELECT e.*, ea.EvaluatorRole, g.GroupName, p.Title AS ProjectTitle, m.Title AS MilestoneTitle 
             FROM evaluation e 
             JOIN evaluation_assignment ea ON e.EvaluationID = ea.EvaluationID 
             JOIN \`groups\` g ON e.GroupID = g.GroupID 
             JOIN project p ON g.ProjectID = p.ProjectID 
             JOIN milestone m ON e.MilestoneID = m.MilestoneID 
             WHERE ea.EvaluatorID = ? 
             ORDER BY e.EvaluationDate ASC`,
            [evaluatorId]
        );

        res.json({
            stats: {
                assigned: assignedCount,
                completed: completedCount,
                pending: pendingCount,
                averageMarks: averageMarks
            },
            evaluations: evaluationsList.map(ev => ({
                evaluationId: ev.EvaluationID,
                date: ev.EvaluationDate,
                role: ev.EvaluatorRole,
                groupName: ev.GroupName,
                projectTitle: ev.ProjectTitle,
                milestone: ev.MilestoneTitle,
                status: ev.Status
            }))
        });
    } catch (err) {
        console.error('Error fetching evaluator dashboard:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get marking sheet (evaluation details & rubrics)
exports.getMarkingSheet = async (req, res) => {
    const { evaluationId } = req.params;

    try {
        // Get evaluation details
        const [evaluations] = await pool.query(
            `SELECT e.*, g.GroupName, p.Title AS ProjectTitle, m.Title AS MilestoneTitle 
             FROM evaluation e 
             JOIN \`groups\` g ON e.GroupID = g.GroupID 
             JOIN project p ON g.ProjectID = p.ProjectID 
             JOIN milestone m ON e.MilestoneID = m.MilestoneID 
             WHERE e.EvaluationID = ?`,
            [evaluationId]
        );

        if (evaluations.length === 0) {
            return res.status(404).json({ message: 'Evaluation session not found' });
        }

        // Get rubric criteria
        const [criteria] = await pool.query(
            'SELECT * FROM evaluation_criteria WHERE EvaluationID = ?',
            [evaluationId]
        );

        // Get existing results (if already marked)
        const [existingResults] = await pool.query(
            'SELECT * FROM evaluation_result WHERE EvaluationID = ?',
            [evaluationId]
        );

        res.json({
            evaluation: {
                evaluationId: evaluations[0].EvaluationID,
                date: evaluations[0].EvaluationDate,
                groupName: evaluations[0].GroupName,
                projectTitle: evaluations[0].ProjectTitle,
                milestone: evaluations[0].MilestoneTitle,
                status: evaluations[0].Status
            },
            rubrics: criteria.map(c => {
                const result = existingResults.find(r => r.CriteriaID === c.CriteriaID);
                return {
                    criteriaId: c.CriteriaID,
                    criteriaName: c.CriteriaName,
                    maxMarks: parseFloat(c.MaxMarks),
                    description: c.Description,
                    obtainedMarks: result ? parseFloat(result.ObtainedMarks) : null,
                    remarks: result ? result.Remarks : ''
                };
            })
        });
    } catch (err) {
        console.error('Error fetching marking sheet:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Record/Save evaluation marks
exports.recordMarks = async (req, res) => {
    const { evaluationId, marks } = req.body; // marks is array of { criteriaId, obtainedMarks, remarks }

    if (!evaluationId || !Array.isArray(marks)) {
        return res.status(400).json({ message: 'evaluationId and marks array are required' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        for (const m of marks) {
            // Validate that obtained marks do not exceed maximum marks
            const [criteriaList] = await conn.query(
                'SELECT MaxMarks, CriteriaName FROM evaluation_criteria WHERE CriteriaID = ?',
                [m.criteriaId]
            );

            if (criteriaList.length === 0) {
                await conn.rollback();
                return res.status(404).json({ message: `Evaluation criteria ID ${m.criteriaId} not found` });
            }

            const maxMarks = parseFloat(criteriaList[0].MaxMarks);
            const obtained = parseFloat(m.obtainedMarks);

            if (obtained > maxMarks) {
                await conn.rollback();
                return res.status(400).json({ 
                    message: `Obtained marks for '${criteriaList[0].CriteriaName}' (${obtained}) cannot exceed maximum marks (${maxMarks})` 
                });
            }

            // Delete previous result if exists to avoid duplication
            await conn.query(
                'DELETE FROM evaluation_result WHERE EvaluationID = ? AND CriteriaID = ?',
                [evaluationId, m.criteriaId]
            );

            // Insert new result
            await conn.query(
                `INSERT INTO evaluation_result (EvaluationID, CriteriaID, ObtainedMarks, Remarks) 
                 VALUES (?, ?, ?, ?)`,
                [evaluationId, m.criteriaId, m.obtainedMarks, m.remarks || '']
            );
        }

        // Update evaluation session status to 'Completed'
        await conn.query(
            "UPDATE evaluation SET Status = 'Completed' WHERE EvaluationID = ?",
            [evaluationId]
        );

        await conn.commit();
        res.json({ message: 'Marks recorded successfully' });
    } catch (err) {
        await conn.rollback();
        console.error('Error recording marks:', err);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        conn.release();
    }
};

// Schedule an evaluation session (Coordinator)
exports.scheduleEvaluation = async (req, res) => {
    const { milestoneId, groupId, evaluationDate } = req.body;

    if (!milestoneId || !groupId || !evaluationDate) {
        return res.status(400).json({ message: 'MilestoneID, GroupID, and EvaluationDate are required' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO evaluation (MilestoneID, GroupID, EvaluationDate, Status) 
             VALUES (?, ?, ?, 'Scheduled')`,
            [milestoneId, groupId, evaluationDate]
        );
        res.status(201).json({ message: 'Evaluation scheduled successfully', evaluationId: result.insertId });
    } catch (err) {
        console.error('Error scheduling evaluation:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create evaluation rubric criteria (Coordinator)
exports.createCriteria = async (req, res) => {
    const { evaluationId, criteriaName, maxMarks, description } = req.body;

    if (!evaluationId || !criteriaName || !maxMarks) {
        return res.status(400).json({ message: 'EvaluationID, CriteriaName, and MaxMarks are required' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO evaluation_criteria (EvaluationID, CriteriaName, MaxMarks, Description) 
             VALUES (?, ?, ?, ?)`,
            [evaluationId, criteriaName, maxMarks, description || '']
        );
        res.status(201).json({ message: 'Rubric criteria created successfully', criteriaId: result.insertId });
    } catch (err) {
        console.error('Error creating criteria:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Assign evaluator to evaluation session (Coordinator)
exports.assignEvaluator = async (req, res) => {
    const { evaluationId, evaluatorId, evaluatorRole } = req.body;

    if (!evaluationId || !evaluatorId || !evaluatorRole) {
        return res.status(400).json({ message: 'EvaluationID, EvaluatorID, and EvaluatorRole are required' });
    }

    try {
        const today = new Date().toISOString().slice(0, 10);
        await pool.query(
            `INSERT INTO evaluation_assignment (EvaluationID, EvaluatorID, EvaluatorRole, AssignedDate) 
             VALUES (?, ?, ?, ?)`,
            [evaluationId, evaluatorId, evaluatorRole, today]
        );
        res.status(201).json({ message: 'Evaluator assigned successfully' });
    } catch (err) {
        console.error('Error assigning evaluator:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// List all evaluations
exports.listAllEvaluations = async (req, res) => {
    try {
        const [evaluations] = await pool.query(
            `SELECT e.EvaluationID, e.EvaluationDate, e.Status, g.GroupName, p.Title AS ProjectTitle, 
                    m.Title AS MilestoneTitle,
                    IFNULL(GROUP_CONCAT(CONCAT(per.FirstName, ' ', IFNULL(per.LastName, '')) SEPARATOR ', '), 'Unassigned') AS Evaluators
             FROM evaluation e
             JOIN \`groups\` g ON e.GroupID = g.GroupID
             JOIN project p ON g.ProjectID = p.ProjectID
             JOIN milestone m ON e.MilestoneID = m.MilestoneID
             LEFT JOIN evaluation_assignment ea ON e.EvaluationID = ea.EvaluationID
             LEFT JOIN evaluators ev ON ea.EvaluatorID = ev.EvaluatorID
             LEFT JOIN person per ON ev.PersonID = per.PersonID
             GROUP BY e.EvaluationID
             ORDER BY e.EvaluationDate DESC`
        );
        res.json(evaluations);
    } catch (err) {
        console.error('Error listing all evaluations:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// List all evaluators
exports.listEvaluators = async (req, res) => {
    try {
        const [evaluators] = await pool.query(
            `SELECT e.EvaluatorID, e.EvaluatorType, p.FirstName, p.LastName, p.Email 
             FROM evaluators e 
             JOIN person p ON e.PersonID = p.PersonID
             ORDER BY p.FirstName, p.LastName`
        );
        res.json(evaluators);
    } catch (err) {
        console.error('Error listing evaluators:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add external evaluator (coordinator only)
exports.addExternalEvaluator = async (req, res) => {
    const { firstName, lastName, email, cnic, gender } = req.body;
    if (!firstName || !email || !cnic) {
        return res.status(400).json({ message: 'firstName, email and cnic are required' });
    }
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Check duplicate email
        const [dup] = await conn.query('SELECT PersonID FROM person WHERE Email=?', [email]);
        if (dup.length > 0) {
            await conn.rollback();
            return res.status(400).json({ message: 'Email already exists in the system' });
        }

        // Insert person as External type
        const [pRes] = await conn.query(
            `INSERT INTO person (FirstName,LastName,Email,CNIC,Gender,PersonType) VALUES (?,?,?,?,?,'External')`,
            [firstName, lastName || '', email, cnic, gender || 'Male']
        );
        const personId = pRes.insertId;

        // Insert into evaluators
        await conn.query('INSERT INTO evaluators (PersonID,EvaluatorType) VALUES (?,?)', [personId, 'External']);

        // Create user account
        const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g,'_').substring(0,49);
        const bcrypt = require('bcryptjs');
        const pwd = bcrypt.hashSync('evaluator123', 10);
        const [accRes] = await conn.query(
            `INSERT INTO user_account (Username,Password,Status,PersonID) VALUES (?,?,'Active',?)`,
            [username, pwd, personId]
        );

        // Assign Faculty role (evaluators share Faculty role)
        const [roleRow] = await conn.query("SELECT RoleID FROM role WHERE RoleName='Faculty' LIMIT 1");
        if (roleRow.length) {
            await conn.query('INSERT INTO useraccount_role (AccountID,RoleID) VALUES (?,?)', [accRes.insertId, roleRow[0].RoleID]);
        }

        await conn.commit();
        res.status(201).json({ message: 'External evaluator added successfully', personId });
    } catch (err) {
        await conn.rollback();
        console.error('Add external evaluator error:', err);
        res.status(500).json({ message: err.message || 'Internal server error' });
    } finally {
        conn.release();
    }
};
