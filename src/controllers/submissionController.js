const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

// Get all submissions for a project (any milestone) – used by student page
exports.getAllForProject = async (req, res) => {
    const { projectId } = req.params;
    try {
        const [submissions] = await pool.query(
            `SELECT s.*, m.Title AS MilestoneTitle,
                    sf.FileID, sf.FileName, sf.FilePath, sf.FileType, sf.FileSize
             FROM submission s
             JOIN milestone m ON s.MilestoneID = m.MilestoneID
             LEFT JOIN submission_file sf ON s.SubmissionID = sf.SubmissionID
             WHERE s.ProjectID = ?
             ORDER BY s.SubmissionID DESC`,
            [projectId]
        );
        res.json(submissions);
    } catch (err) {
        console.error('Error fetching all project submissions:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get submission history for a specific project + milestone
exports.getHistory = async (req, res) => {
    const { projectId, milestoneId } = req.params;
    try {
        const [submissions] = await pool.query(
            `SELECT s.*, m.Title AS MilestoneTitle,
                    sf.FileID, sf.FileName, sf.FilePath, sf.FileType, sf.FileSize
             FROM submission s
             JOIN milestone m ON s.MilestoneID = m.MilestoneID
             LEFT JOIN submission_file sf ON s.SubmissionID = sf.SubmissionID
             WHERE s.ProjectID = ? AND s.MilestoneID = ?
             ORDER BY s.SubmissionID DESC`,
            [projectId, milestoneId]
        );
        res.json(submissions);
    } catch (err) {
        console.error('Error fetching submission history:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create a new submission with optional file upload
exports.createSubmission = async (req, res) => {
    const { projectId, milestoneId, submissionType } = req.body;

    if (!projectId || !milestoneId || !submissionType) {
        // If a file was uploaded but params are missing, clean it up
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'ProjectID, MilestoneID, and SubmissionType are required' });
    }

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // Check milestone exists and is Active
        const [milestones] = await conn.query('SELECT Status FROM milestone WHERE MilestoneID = ?', [milestoneId]);
        if (milestones.length === 0) {
            await conn.rollback();
            return res.status(404).json({ message: 'Milestone not found' });
        }
        if (milestones[0].Status !== 'Active') {
            await conn.rollback();
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: `Cannot submit to a milestone with status: ${milestones[0].Status}` });
        }

        // Calculate version
        const [versions] = await conn.query(
            'SELECT COUNT(*) AS count FROM submission WHERE ProjectID = ? AND MilestoneID = ?',
            [projectId, milestoneId]
        );
        const version = `v${versions[0].count + 1}.0`;

        // Insert submission
        const [subResult] = await conn.query(
            `INSERT INTO submission (ProjectID, MilestoneID, SubmissionVersion, SubmissionType, Status)
             VALUES (?, ?, ?, ?, 'Submitted')`,
            [projectId, milestoneId, version, submissionType]
        );
        const submissionId = subResult.insertId;

        // Save file details if uploaded
        let fileDetails = null;
        if (req.file) {
            const fileName = req.file.originalname;
            // Store relative path from project root so it works cross-platform
            const filePath = req.file.path.replace(/\\/g, '/');
            const fileType = req.file.mimetype;
            const fileSize = req.file.size;

            await conn.query(
                `INSERT INTO submission_file (SubmissionID, FileName, FilePath, FileType, FileSize)
                 VALUES (?, ?, ?, ?, ?)`,
                [submissionId, fileName, filePath, fileType, fileSize]
            );
            fileDetails = { fileName, filePath, fileType, fileSize };
        }

        await conn.commit();
        res.status(201).json({
            message: 'Submission created successfully',
            submissionId,
            version,
            file: fileDetails
        });
    } catch (err) {
        await conn.rollback();
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        console.error('Error creating submission:', err);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        conn.release();
    }
};

// Download a submission file by FileID
exports.downloadFile = async (req, res) => {
    const { fileId } = req.params;
    try {
        const [files] = await pool.query('SELECT * FROM submission_file WHERE FileID = ?', [fileId]);
        if (files.length === 0) return res.status(404).json({ message: 'File not found in database' });

        const file = files[0];
        const absolutePath = path.resolve(file.FilePath);

        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ message: `File not found on disk: ${file.FileName}` });
        }
        res.download(absolutePath, file.FileName);
    } catch (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get full detail for one submission (faculty review page)
exports.getSubmissionDetail = async (req, res) => {
    const { submissionId } = req.params;
    try {
        const [submissions] = await pool.query(
            `SELECT s.*, p.Title AS ProjectTitle, g.GroupName,
                    m.Title AS MilestoneTitle,
                    sf.FileID, sf.FileName, sf.FilePath, sf.FileSize
             FROM submission s
             JOIN project p  ON s.ProjectID  = p.ProjectID
             JOIN \`groups\` g ON p.ProjectID = g.ProjectID
             JOIN milestone m ON s.MilestoneID = m.MilestoneID
             LEFT JOIN submission_file sf ON s.SubmissionID = sf.SubmissionID
             WHERE s.SubmissionID = ?
             LIMIT 1`,
            [submissionId]
        );
        if (submissions.length === 0) return res.status(404).json({ message: 'Submission not found' });

        const sub = submissions[0];

        const [feedbacks] = await pool.query(
            `SELECT f.*, per.FirstName, per.LastName
             FROM feedback f
             JOIN faculty fac ON f.FacultyID = fac.FacultyID
             JOIN person  per ON fac.FacultyID = per.PersonID
             WHERE f.SubmissionID = ?
             ORDER BY f.FeedbackDate ASC`,
            [submissionId]
        );

        res.json({
            submission: {
                submissionId:   sub.SubmissionID,
                projectTitle:   sub.ProjectTitle,
                groupName:      sub.GroupName,
                milestoneTitle: sub.MilestoneTitle,
                version:        sub.SubmissionVersion,
                status:         sub.Status,
                type:           sub.SubmissionType,
                fileId:         sub.FileID,
                fileName:       sub.FileName,
                filePath:       sub.FilePath,
                fileSize:       sub.FileSize
            },
            history: feedbacks.map(fb => ({
                id:          fb.FeedbackID,
                date:        fb.FeedbackDate,
                facultyName: `${fb.FirstName} ${fb.LastName || ''}`.trim(),
                comment:     fb.Comment,
                type:        fb.FeedbackType,
                avatar:      `https://ui-avatars.com/api/?name=${encodeURIComponent(fb.FirstName + ' ' + (fb.LastName || ''))}&background=0D9488&color=fff`
            }))
        });
    } catch (err) {
        console.error('Error fetching submission detail:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// List all submissions (Coordinator view)
exports.listAllSubmissions = async (req, res) => {
    try {
        const [submissions] = await pool.query(
            `SELECT s.*, p.Title AS ProjectTitle, g.GroupName,
                    m.Title AS MilestoneTitle,
                    sf.FileID, sf.FileName
             FROM submission s
             JOIN project p    ON s.ProjectID  = p.ProjectID
             JOIN \`groups\` g ON p.ProjectID  = g.ProjectID
             JOIN milestone m  ON s.MilestoneID = m.MilestoneID
             LEFT JOIN submission_file sf ON s.SubmissionID = sf.SubmissionID
             ORDER BY s.SubmissionID DESC`
        );
        res.json(submissions);
    } catch (err) {
        console.error('Error listing all submissions:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
