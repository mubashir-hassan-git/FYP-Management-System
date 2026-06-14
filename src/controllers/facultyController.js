const pool = require('../config/db');

// Get faculty dashboard overview data
exports.getDashboard = async (req, res) => {
    const facultyId = req.user.personId;

    try {
        // 1. Assigned Projects Count
        const [assigned] = await pool.query(
            'SELECT COUNT(*) AS count FROM project_supervision WHERE FacultyID = ?',
            [facultyId]
        );
        const assignedCount = assigned[0].count;

        // 2. Pending Reviews Count (submissions with status 'Submitted' or 'Late_Submission' on supervised projects)
        const [pending] = await pool.query(
            `SELECT COUNT(*) AS count 
             FROM submission s 
             JOIN project_supervision ps ON s.ProjectID = ps.ProjectID 
             WHERE ps.FacultyID = ? AND s.Status IN ('Submitted', 'Late_Submission')`,
            [facultyId]
        );
        const pendingCount = pending[0].count;

        // 3. Reviewed Submissions Count (submissions with status 'Reviewed' on supervised projects)
        const [reviewed] = await pool.query(
            `SELECT COUNT(*) AS count 
             FROM submission s 
             JOIN project_supervision ps ON s.ProjectID = ps.ProjectID 
             WHERE ps.FacultyID = ? AND s.Status = 'Reviewed'`,
            [facultyId]
        );
        const reviewedCount = reviewed[0].count;

        // 4. Upcoming Evaluations Count (scheduled evaluations for supervised groups)
        const [upcoming] = await pool.query(
            `SELECT COUNT(*) AS count 
             FROM evaluation e 
             JOIN ` + "`groups`" + ` g ON e.GroupID = g.GroupID 
             JOIN project_supervision ps ON g.ProjectID = ps.ProjectID 
             WHERE ps.FacultyID = ? AND e.Status = 'Scheduled'`,
            [facultyId]
        );
        const upcomingCount = upcoming[0].count;

        // 5. Supervised projects list (Project Title, Group, Active Milestone, Completion %, Risk level)
        const [supervisedProjects] = await pool.query(
            `SELECT p.*, g.GroupName, g.GroupID,
                    MIN(b.BatchID) AS BatchID
             FROM project_supervision ps
             JOIN project p ON ps.ProjectID = p.ProjectID
             LEFT JOIN \`groups\` g ON p.ProjectID = g.ProjectID
             LEFT JOIN student s ON g.GroupID = s.GroupID
             LEFT JOIN batch b ON s.BatchID = b.BatchID
             WHERE ps.FacultyID = ?
             GROUP BY p.ProjectID, g.GroupName, g.GroupID`,
            [facultyId]
        );

        const projectsList = [];
        for (const p of supervisedProjects) {
            // Find total milestones for this project's batch
            let totalMilestones = 0;
            let completedMilestones = 0;
            let activeMilestone = 'None';
            let progress = 0;

            if (p.BatchID) {
                const [mCount] = await pool.query(
                    'SELECT COUNT(*) AS count FROM milestone WHERE BatchID = ?',
                    [p.BatchID]
                );
                totalMilestones = mCount[0].count;

                const [completed] = await pool.query(
                    `SELECT COUNT(DISTINCT MilestoneID) AS count 
                     FROM submission 
                     WHERE ProjectID = ? AND Status = 'Reviewed'`,
                    [p.ProjectID]
                );
                completedMilestones = completed[0].count;

                // Find active milestone (earliest active milestone not reviewed yet)
                const [active] = await pool.query(
                    `SELECT Title FROM milestone 
                     WHERE BatchID = ? AND MilestoneID NOT IN (
                         SELECT MilestoneID FROM submission WHERE ProjectID = ? AND Status = 'Reviewed'
                     ) ORDER BY DueDate ASC LIMIT 1`,
                    [p.BatchID, p.ProjectID]
                );
                if (active.length > 0) {
                    activeMilestone = active[0].Title;
                } else {
                    activeMilestone = 'Completed All';
                }
            }

            if (totalMilestones > 0) {
                progress = Math.round((completedMilestones / totalMilestones) * 100);
            }

            // Calculate Risk Level (Low if progress >= 60%, Medium if >=30%, High if <30%)
            let risk = 'Low';
            if (progress < 30) risk = 'High';
            else if (progress < 60) risk = 'Medium';

            projectsList.push({
                projectId: p.ProjectID,
                title: p.Title,
                groupName: p.GroupName || 'No Group',
                activeMilestone,
                progress,
                risk
            });
        }

        // 6. Submissions Queue (list of pending submissions from supervised groups)
        const [submissionsQueue] = await pool.query(
            `SELECT s.*, sf.FileName, sf.FileID, g.GroupName, m.Title AS MilestoneTitle, s.SubmissionVersion 
             FROM submission s 
             JOIN project_supervision ps ON s.ProjectID = ps.ProjectID 
             JOIN ` + "`groups`" + ` g ON ps.ProjectID = g.ProjectID 
             JOIN milestone m ON s.MilestoneID = m.MilestoneID 
             LEFT JOIN submission_file sf ON s.SubmissionID = sf.SubmissionID 
             WHERE ps.FacultyID = ? AND s.Status IN ('Submitted', 'Late_Submission') 
             ORDER BY s.SubmissionID DESC`,
            [facultyId]
        );

        res.json({
            stats: {
                assignedProjects: assignedCount,
                pendingReviews: pendingCount,
                reviewedSubmissions: reviewedCount,
                upcomingEvaluations: upcomingCount
            },
            projects: projectsList,
            queue: submissionsQueue.map(sub => ({
                submissionId: sub.SubmissionID,
                fileName: sub.FileName || 'No File',
                fileId: sub.FileID,
                groupName: sub.GroupName,
                milestone: sub.MilestoneTitle,
                version: sub.SubmissionVersion,
                date: sub.Status === 'Late_Submission' ? 'Late Submission' : 'Just now'
            }))
        });
    } catch (err) {
        console.error('Error fetching faculty dashboard:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all supervised projects
exports.getProjects = async (req, res) => {
    const facultyId = req.user.personId;

    try {
        const [projects] = await pool.query(
            `SELECT p.*, g.GroupName, g.GroupID, GROUP_CONCAT(CONCAT(per.FirstName, ' ', IFNULL(per.LastName, '')) SEPARATOR ', ') AS members 
             FROM project_supervision ps 
             JOIN project p ON ps.ProjectID = p.ProjectID 
             LEFT JOIN ` + "`groups`" + ` g ON p.ProjectID = g.ProjectID 
             LEFT JOIN student s ON g.GroupID = s.GroupID 
             LEFT JOIN person per ON s.StudentID = per.PersonID 
             WHERE ps.FacultyID = ? 
             GROUP BY p.ProjectID`,
            [facultyId]
        );
        res.json(projects);
    } catch (err) {
        console.error('Error fetching supervised projects:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get supervised student groups
exports.getGroups = async (req, res) => {
    const facultyId = req.user.personId;

    try {
        const [groups] = await pool.query(
            `SELECT g.*, p.Title AS ProjectTitle 
             FROM project_supervision ps 
             JOIN ` + "`groups`" + ` g ON ps.ProjectID = g.ProjectID 
             JOIN project p ON g.ProjectID = p.ProjectID 
             WHERE ps.FacultyID = ?`,
            [facultyId]
        );

        const formattedGroups = [];
        for (const g of groups) {
            const [students] = await pool.query(
                `SELECT s.RegistrationNo, per.FirstName, per.LastName 
                 FROM student s 
                 JOIN person per ON s.StudentID = per.PersonID 
                 WHERE s.GroupID = ?`,
                [g.GroupID]
            );

            formattedGroups.push({
                groupId: g.GroupID,
                groupName: g.GroupName,
                projectTitle: g.ProjectTitle,
                students: students.map(s => `${s.FirstName} ${s.LastName || ''} (${s.RegistrationNo})`).join(', ')
            });
        }

        res.json(formattedGroups);
    } catch (err) {
        console.error('Error fetching supervised groups:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get submissions from supervised projects
exports.getSubmissions = async (req, res) => {
    const facultyId = req.user.personId;

    try {
        const [subs] = await pool.query(
            `SELECT s.*, sf.FileID, sf.FileName, g.GroupName, m.Title AS MilestoneTitle 
             FROM submission s 
             JOIN project_supervision ps ON s.ProjectID = ps.ProjectID 
             JOIN ` + "`groups`" + ` g ON ps.ProjectID = g.ProjectID 
             JOIN milestone m ON s.MilestoneID = m.MilestoneID 
             LEFT JOIN submission_file sf ON s.SubmissionID = sf.SubmissionID 
             WHERE ps.FacultyID = ? 
             ORDER BY s.SubmissionID DESC`,
            [facultyId]
        );
        res.json(subs);
    } catch (err) {
        console.error('Error fetching faculty submissions:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add feedback on a submission
exports.addFeedback = async (req, res) => {
    const facultyId = req.user.personId;
    const { submissionId, comment, feedbackType } = req.body;

    if (!submissionId || !comment || !feedbackType) {
        return res.status(400).json({ message: 'submissionId, comment, and feedbackType are required' });
    }

    try {
        // Enforce restriction: Only assigned supervisor/co-supervisor can provide feedback
        const [supervisions] = await pool.query(
            `SELECT * FROM project_supervision ps 
             JOIN submission s ON ps.ProjectID = s.ProjectID 
             WHERE s.SubmissionID = ? AND ps.FacultyID = ?`,
            [submissionId, facultyId]
        );

        if (supervisions.length === 0) {
            return res.status(403).json({ message: 'Only the assigned supervisor or co-supervisor can provide feedback' });
        }

        // Insert feedback
        const today = new Date().toISOString().slice(0, 10);
        await pool.query(
            `INSERT INTO feedback (SubmissionID, FacultyID, Comment, FeedbackType, FeedbackDate) 
             VALUES (?, ?, ?, ?, ?)`,
            [submissionId, facultyId, comment, feedbackType, today]
        );

        // Update submission status to 'Reviewed'
        await pool.query(
            "UPDATE submission SET Status = 'Reviewed' WHERE SubmissionID = ?",
            [submissionId]
        );

        res.status(201).json({ message: 'Feedback added successfully' });
    } catch (err) {
        console.error('Error adding feedback:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update feedback on a submission
exports.updateFeedback = async (req, res) => {
    const facultyId = req.user.personId;
    const { feedbackId } = req.params;
    const { comment, feedbackType } = req.body;

    if (!comment || !feedbackType) {
        return res.status(400).json({ message: 'comment and feedbackType are required' });
    }

    try {
        // Enforce restriction: Only assigned supervisor/co-supervisor can edit feedback
        const [supervisions] = await pool.query(
            `SELECT * FROM project_supervision ps 
             JOIN submission s ON ps.ProjectID = s.ProjectID 
             JOIN feedback f ON s.SubmissionID = f.SubmissionID 
             WHERE f.FeedbackID = ? AND ps.FacultyID = ?`,
            [feedbackId, facultyId]
        );

        if (supervisions.length === 0) {
            return res.status(403).json({ message: 'Only the assigned supervisor or co-supervisor can modify this feedback' });
        }

        const [result] = await pool.query(
            `UPDATE feedback SET Comment = ?, FeedbackType = ? 
             WHERE FeedbackID = ?`,
            [comment, feedbackType, feedbackId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Feedback record not found' });
        }

        res.json({ message: 'Feedback updated successfully' });
    } catch (err) {
        console.error('Error updating feedback:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
