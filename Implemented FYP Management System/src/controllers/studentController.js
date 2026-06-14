const pool = require('../config/db');

// Get student dashboard overview details
exports.getDashboard = async (req, res) => {
    const studentId = req.user.personId;

    try {
        // 1. Get student and person details
        const [students] = await pool.query(
            `SELECT s.*, p.FirstName, p.LastName, p.Email 
             FROM student s 
             JOIN person p ON s.StudentID = p.PersonID 
             WHERE s.StudentID = ?`,
            [studentId]
        );

        if (students.length === 0) {
            return res.status(404).json({ message: 'Student details not found' });
        }

        const student = students[0];
        const groupId = student.GroupID;

        let groupName = 'N/A';
        let projectTitle = 'N/A';
        let projectDomain = 'N/A';
        let projectStatus = 'Pending';
        let supervisorName = 'N/A';
        let coSupervisorName = 'N/A';
        let projectId = null;

        // 2. Get group details
        if (groupId) {
            const [groups] = await pool.query('SELECT * FROM `groups` WHERE GroupID = ?', [groupId]);
            if (groups.length > 0) {
                groupName = groups[0].GroupName;
                projectId = groups[0].ProjectID;
            }
        }

        // 3. Get project details
        if (projectId) {
            const [projects] = await pool.query('SELECT * FROM project WHERE ProjectID = ?', [projectId]);
            if (projects.length > 0) {
                projectTitle = projects[0].Title;
                projectDomain = projects[0].Domain;
                projectStatus = projects[0].ProjectStatus;
            }

            // 4. Get supervisor / co-supervisor details
            const [supervisors] = await pool.query(
                `SELECT ps.Role, p.FirstName, p.LastName 
                 FROM project_supervision ps 
                 JOIN faculty f ON ps.FacultyID = f.FacultyID 
                 JOIN person p ON f.FacultyID = p.PersonID 
                 WHERE ps.ProjectID = ?`,
                [projectId]
            );

            supervisors.forEach(s => {
                const name = `${s.FirstName} ${s.LastName || ''}`.trim();
                if (s.Role.toLowerCase() === 'supervisor') {
                    supervisorName = name;
                } else if (s.Role.toLowerCase() === 'co-supervisor') {
                    coSupervisorName = name;
                }
            });
        }

        // 5. Get milestone statistics using the database view
        let totalMilestones = 0;
        let completedMilestones = 0;
        let pendingMilestones = 0;
        let milestoneTimeline = [];

        if (groupId && groupName !== 'N/A') {
            const [milestoneDash] = await pool.query(
                'SELECT * FROM view_student_milestone_dashboards WHERE AssignedGroup = ?',
                [groupName]
            );

            totalMilestones = milestoneDash.length;
            milestoneDash.forEach(m => {
                if (m.SubmissionStatus !== 'PENDING') {
                    completedMilestones++;
                } else {
                    pendingMilestones++;
                }
                milestoneTimeline.push({
                    title: m.MilestoneName,
                    dueDate: m.Deadline,
                    status: m.SubmissionStatus !== 'PENDING' ? 'Done' : 'Pending',
                    file: m.AttachedFile
                });
            });
        }

        // 6. Get team members
        let teamMembers = [];
        if (groupId) {
            const [members] = await pool.query(
                `SELECT s.StudentID, s.RegistrationNo, p.FirstName, p.LastName 
                 FROM student s 
                 JOIN person p ON s.StudentID = p.PersonID 
                 WHERE s.GroupID = ?`,
                [groupId]
            );
            teamMembers = members.map(m => ({
                id: m.StudentID,
                regNo: m.RegistrationNo,
                name: `${m.FirstName} ${m.LastName || ''}`.trim(),
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(m.FirstName + ' ' + (m.LastName || ''))}&background=random`
            }));
        }

        // 7. Get latest feedback
        let latestFeedback = null;
        if (projectId) {
            const [feedbackList] = await pool.query(
                `SELECT f.*, p.FirstName, p.LastName, s.SubmissionVersion 
                 FROM feedback f 
                 JOIN faculty fac ON f.FacultyID = fac.FacultyID 
                 JOIN person p ON fac.FacultyID = p.PersonID 
                 JOIN submission s ON f.SubmissionID = s.SubmissionID 
                 WHERE s.ProjectID = ? 
                 ORDER BY f.FeedbackDate DESC, f.FeedbackID DESC LIMIT 1`,
                [projectId]
            );
            if (feedbackList.length > 0) {
                const fb = feedbackList[0];
                latestFeedback = {
                    date: fb.FeedbackDate,
                    comment: fb.Comment,
                    type: fb.FeedbackType,
                    facultyName: `${fb.FirstName} ${fb.LastName || ''}`.trim(),
                    version: fb.SubmissionVersion,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fb.FirstName + ' ' + (fb.LastName || ''))}&background=0D9488&color=fff`
                };
            }
        }

        // 8. Get submissions list for dashboard
        let submissionsList = [];
        if (projectId) {
            const [subs] = await pool.query(
                `SELECT s.*, m.Title AS MilestoneTitle, sf.FileID, sf.FileName 
                 FROM submission s 
                 JOIN milestone m ON s.MilestoneID = m.MilestoneID 
                 LEFT JOIN submission_file sf ON s.SubmissionID = sf.SubmissionID 
                 WHERE s.ProjectID = ? 
                 ORDER BY s.SubmissionID DESC LIMIT 5`,
                [projectId]
            );
            submissionsList = subs.map(sub => ({
                submissionId: sub.SubmissionID,
                milestone: sub.MilestoneTitle,
                date: new Date(sub.SubmissionID * 1000).toLocaleDateString(), // Mock formatted date
                status: sub.Status,
                fileId: sub.FileID,
                fileName: sub.FileName
            }));
        }

        res.json({
            student: {
                name: `${student.FirstName} ${student.LastName || ''}`.trim(),
                regNo: student.RegistrationNo,
                groupName,
                projectTitle,
                projectDomain,
                projectStatus,
                supervisorName,
                coSupervisorName,
                projectId,
                groupId
            },
            stats: {
                totalMilestones,
                completedMilestones,
                pendingMilestones,
                projectStatus
            },
            timeline: milestoneTimeline,
            team: teamMembers,
            feedback: latestFeedback,
            submissions: submissionsList
        });
    } catch (err) {
        console.error('Error fetching student dashboard:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get milestones for student's batch
exports.getMilestones = async (req, res) => {
    const studentId = req.user.personId;

    try {
        const [milestones] = await pool.query(
            `SELECT m.* 
             FROM milestone m 
             JOIN student s ON s.BatchID = m.BatchID 
             WHERE s.StudentID = ? 
             ORDER BY m.DueDate ASC`,
            [studentId]
        );
        res.json(milestones);
    } catch (err) {
        console.error('Error fetching student milestones:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get supervisor feedback for student project
exports.getFeedback = async (req, res) => {
    const studentId = req.user.personId;

    try {
        // Get project id
        const [students] = await pool.query('SELECT GroupID FROM student WHERE StudentID = ?', [studentId]);
        if (students.length === 0 || !students[0].GroupID) {
            return res.json([]);
        }
        const [groups] = await pool.query('SELECT ProjectID FROM `groups` WHERE GroupID = ?', [students[0].GroupID]);
        if (groups.length === 0 || !groups[0].ProjectID) {
            return res.json([]);
        }
        const projectId = groups[0].ProjectID;

        const [feedbackList] = await pool.query(
            `SELECT f.*, p.FirstName, p.LastName, s.SubmissionVersion, m.Title AS MilestoneTitle 
             FROM feedback f 
             JOIN faculty fac ON f.FacultyID = fac.FacultyID 
             JOIN person p ON fac.FacultyID = p.PersonID 
             JOIN submission s ON f.SubmissionID = s.SubmissionID 
             JOIN milestone m ON s.MilestoneID = m.MilestoneID 
             WHERE s.ProjectID = ? 
             ORDER BY f.FeedbackDate DESC`,
            [projectId]
        );

        const formattedFeedback = feedbackList.map(fb => ({
            id: fb.FeedbackID,
            date: fb.FeedbackDate,
            facultyName: `${fb.FirstName} ${fb.LastName || ''}`.trim(),
            comments: fb.Comment,
            type: fb.FeedbackType,
            version: fb.SubmissionVersion,
            milestone: fb.MilestoneTitle
        }));

        res.json(formattedFeedback);
    } catch (err) {
        console.error('Error fetching feedback:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get evaluation results for student
exports.getResults = async (req, res) => {
    const studentId = req.user.personId;

    try {
        const [students] = await pool.query('SELECT GroupID FROM student WHERE StudentID = ?', [studentId]);
        if (students.length === 0 || !students[0].GroupID) {
            return res.json({ results: [], totalMax: 0, totalObtained: 0, percentage: 0 });
        }
        const groupId = students[0].GroupID;

        const [results] = await pool.query(
            `SELECT er.*, ec.CriteriaName, ec.MaxMarks, m.Title AS MilestoneTitle 
             FROM evaluation_result er 
             JOIN evaluation_criteria ec ON er.CriteriaID = ec.CriteriaID 
             JOIN evaluation e ON er.EvaluationID = e.EvaluationID 
             JOIN milestone m ON e.MilestoneID = m.MilestoneID 
             WHERE e.GroupID = ? AND e.Status = 'Completed'`,
            [groupId]
        );

        let totalMax = 0;
        let totalObtained = 0;

        const formattedResults = results.map(r => {
            const max = parseFloat(r.MaxMarks);
            const obt = parseFloat(r.ObtainedMarks);
            totalMax += max;
            totalObtained += obt;

            return {
                id: r.ResultID,
                criteria: r.CriteriaName,
                maxMarks: max,
                obtainedMarks: obt,
                remarks: r.Remarks,
                milestone: r.MilestoneTitle
            };
        });

        const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;

        res.json({
            results: formattedResults,
            totalMax,
            totalObtained,
            percentage
        });
    } catch (err) {
        console.error('Error fetching results:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
