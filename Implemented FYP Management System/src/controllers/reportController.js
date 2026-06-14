const pool = require('../config/db');

// Helper to convert array of objects to CSV string
function convertToCSV(data) {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header];
            const escaped = ('' + (val ?? '')).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

// Get raw report data
exports.getReportData = async (req, res) => {
    const { type } = req.query;

    try {
        let data = [];
        if (type === 'progress') {
            const [rows] = await pool.query(
                `SELECT s.RegistrationNo, per.FirstName, per.LastName, b.BatchName, 
                        IFNULL(g.GroupName, 'No Group') AS GroupName, m.Title AS MilestoneTitle, 
                        IFNULL(sub.SubmissionVersion, 'Pending') AS Version, 
                        IFNULL(sub.Status, 'Pending') AS Status 
                 FROM student s 
                 JOIN person per ON s.StudentID = per.PersonID 
                 JOIN batch b ON s.BatchID = b.BatchID 
                 LEFT JOIN \`groups\` g ON s.GroupID = g.GroupID 
                 LEFT JOIN milestone m ON m.BatchID = s.BatchID 
                 LEFT JOIN submission sub ON sub.ProjectID = g.ProjectID AND sub.MilestoneID = m.MilestoneID 
                 ORDER BY s.RegistrationNo, m.DueDate ASC`
            );
            data = rows;
        } else if (type === 'batch') {
            const [rows] = await pool.query(
                `SELECT s.RegistrationNo, CONCAT(per.FirstName, ' ', IFNULL(per.LastName, '')) AS StudentName, 
                        b.BatchName, d.DepartmentName, IFNULL(g.GroupName, 'No Group') AS GroupName 
                 FROM student s 
                 JOIN person per ON s.StudentID = per.PersonID 
                 JOIN batch b ON s.BatchID = b.BatchID 
                 JOIN department d ON b.DepartmentID = d.DepartmentID 
                 LEFT JOIN \`groups\` g ON s.GroupID = g.GroupID 
                 ORDER BY b.BatchName, s.RegistrationNo`
            );
            data = rows;
        } else if (type === 'workload') {
            const [rows] = await pool.query(
                `SELECT per.FirstName, per.LastName, f.EmployeeNo, f.Designation, 
                        COUNT(CASE WHEN ps.Role = 'Supervisor' THEN 1 END) AS SupervisorCount, 
                        COUNT(CASE WHEN ps.Role = 'Co-Supervisor' THEN 1 END) AS CoSupervisorCount, 
                        COUNT(ps.ProjectID) AS TotalProjects 
                 FROM faculty f 
                 JOIN person per ON f.FacultyID = per.PersonID 
                 LEFT JOIN project_supervision ps ON f.FacultyID = ps.FacultyID 
                 GROUP BY f.FacultyID`
            );
            data = rows;
        } else if (type === 'projects') {
            const [rows] = await pool.query(
                `SELECT p.ProjectID, p.Title, p.Domain, p.ProjectStatus AS Status, 
                        IFNULL(g.GroupName, 'Unassigned') AS GroupName, 
                        IFNULL(GROUP_CONCAT(CONCAT(per.FirstName, ' ', per.LastName) SEPARATOR ', '), 'Unassigned') AS Supervisors 
                 FROM project p 
                 LEFT JOIN \`groups\` g ON p.ProjectID = g.ProjectID 
                 LEFT JOIN project_supervision ps ON p.ProjectID = ps.ProjectID 
                 LEFT JOIN faculty f ON ps.FacultyID = f.FacultyID 
                 LEFT JOIN person per ON f.FacultyID = per.PersonID 
                 GROUP BY p.ProjectID`
            );
            data = rows;
        } else if (type === 'evaluations') {
            const [rows] = await pool.query(
                `SELECT e.EvaluationID, e.EvaluationDate, e.Status, g.GroupName, p.Title AS ProjectTitle, 
                        m.Title AS MilestoneTitle, 
                        IFNULL(SUM(er.ObtainedMarks), 0) AS TotalObtained, 
                        IFNULL(SUM(ec.MaxMarks), 0) AS TotalMax 
                 FROM evaluation e 
                 JOIN \`groups\` g ON e.GroupID = g.GroupID 
                 JOIN project p ON g.ProjectID = p.ProjectID 
                 JOIN milestone m ON e.MilestoneID = m.MilestoneID 
                 LEFT JOIN evaluation_result er ON e.EvaluationID = er.EvaluationID 
                 LEFT JOIN evaluation_criteria ec ON er.CriteriaID = ec.CriteriaID 
                 GROUP BY e.EvaluationID`
            );
            data = rows;
        } else if (type === 'milestones') {
            const [rows] = await pool.query(
                `SELECT m.MilestoneID, m.Title, m.DueDate, m.Weightage, m.Status, 
                        COUNT(DISTINCT s.ProjectID) AS CompletedGroupsCount, 
                        (SELECT COUNT(*) FROM \`groups\` WHERE ProjectID IS NOT NULL) AS TotalGroupsCount 
                 FROM milestone m 
                 LEFT JOIN submission s ON m.MilestoneID = s.MilestoneID AND s.Status = 'Reviewed' 
                 GROUP BY m.MilestoneID`
            );
            data = rows;
        } else if (type === 'final') {
            const [rows] = await pool.query(
                `SELECT s.RegistrationNo, CONCAT(per.FirstName, ' ', IFNULL(per.LastName, '')) AS StudentName, 
                        IFNULL(g.GroupName, 'No Group') AS GroupName, IFNULL(p.Title, 'No Project') AS ProjectTitle,
                        IFNULL(SUM(er.ObtainedMarks), 0) AS TotalObtained,
                        IFNULL(SUM(ec.MaxMarks), 0) AS TotalMax,
                        CASE WHEN IFNULL(SUM(ec.MaxMarks), 0) > 0 
                             THEN ROUND((SUM(er.ObtainedMarks) / SUM(ec.MaxMarks)) * 100, 2) 
                             ELSE 0.00 END AS Percentage
                 FROM student s
                 JOIN person per ON s.StudentID = per.PersonID
                 LEFT JOIN \`groups\` g ON s.GroupID = g.GroupID
                 LEFT JOIN project p ON g.ProjectID = p.ProjectID
                 LEFT JOIN evaluation e ON g.GroupID = e.GroupID AND e.Status = 'Completed'
                 LEFT JOIN evaluation_result er ON e.EvaluationID = er.EvaluationID
                 LEFT JOIN evaluation_criteria ec ON er.CriteriaID = ec.CriteriaID
                 GROUP BY s.StudentID
                 ORDER BY s.RegistrationNo`
            );
            data = rows;
        } else {
            return res.status(400).json({ message: 'Invalid report type' });
        }

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Export report as CSV (Excel) or HTML (PDF-friendly Print page)
exports.exportReport = async (req, res) => {
    const { type, format } = req.query;

    try {
        let data = [];
        let title = '';

        if (type === 'progress') {
            title = 'Student Progress Report';
            const [rows] = await pool.query(
                `SELECT s.RegistrationNo, CONCAT(per.FirstName, ' ', IFNULL(per.LastName, '')) AS StudentName, 
                        b.BatchName, IFNULL(g.GroupName, 'No Group') AS GroupName, m.Title AS Milestone, 
                        IFNULL(sub.SubmissionVersion, 'Pending') AS Version, IFNULL(sub.Status, 'Pending') AS Status 
                 FROM student s 
                 JOIN person per ON s.StudentID = per.PersonID 
                 JOIN batch b ON s.BatchID = b.BatchID 
                 LEFT JOIN \`groups\` g ON s.GroupID = g.GroupID 
                 LEFT JOIN milestone m ON m.BatchID = s.BatchID 
                 LEFT JOIN submission sub ON sub.ProjectID = g.ProjectID AND sub.MilestoneID = m.MilestoneID 
                 ORDER BY s.RegistrationNo, m.DueDate ASC`
            );
            data = rows;
        } else if (type === 'batch') {
            title = 'Batch Report';
            const [rows] = await pool.query(
                `SELECT s.RegistrationNo, CONCAT(per.FirstName, ' ', IFNULL(per.LastName, '')) AS StudentName, 
                        b.BatchName, d.DepartmentName, IFNULL(g.GroupName, 'No Group') AS GroupName 
                 FROM student s 
                 JOIN person per ON s.StudentID = per.PersonID 
                 JOIN batch b ON s.BatchID = b.BatchID 
                 JOIN department d ON b.DepartmentID = d.DepartmentID 
                 LEFT JOIN \`groups\` g ON s.GroupID = g.GroupID 
                 ORDER BY b.BatchName, s.RegistrationNo`
            );
            data = rows;
        } else if (type === 'workload') {
            title = 'Faculty Workload Report';
            const [rows] = await pool.query(
                `SELECT CONCAT(per.FirstName, ' ', IFNULL(per.LastName, '')) AS FacultyName, f.EmployeeNo, f.Designation, 
                        COUNT(CASE WHEN ps.Role = 'Supervisor' THEN 1 END) AS SupervisorCount, 
                        COUNT(CASE WHEN ps.Role = 'Co-Supervisor' THEN 1 END) AS CoSupervisorCount, 
                        COUNT(ps.ProjectID) AS TotalProjects 
                 FROM faculty f 
                 JOIN person per ON f.FacultyID = per.PersonID 
                 LEFT JOIN project_supervision ps ON f.FacultyID = ps.FacultyID 
                 GROUP BY f.FacultyID`
            );
            data = rows;
        } else if (type === 'projects') {
            title = 'Project Status Report';
            const [rows] = await pool.query(
                `SELECT p.ProjectID, p.Title AS ProjectTitle, p.Domain, p.ProjectStatus AS Status, 
                        IFNULL(g.GroupName, 'Unassigned') AS GroupName, 
                        IFNULL(GROUP_CONCAT(CONCAT(per.FirstName, ' ', per.LastName) SEPARATOR ', '), 'Unassigned') AS Supervisors 
                 FROM project p 
                 LEFT JOIN \`groups\` g ON p.ProjectID = g.ProjectID 
                 LEFT JOIN project_supervision ps ON p.ProjectID = ps.ProjectID 
                 LEFT JOIN faculty f ON ps.FacultyID = f.FacultyID 
                 LEFT JOIN person per ON f.FacultyID = per.PersonID 
                 GROUP BY p.ProjectID`
            );
            data = rows;
        } else if (type === 'evaluations') {
            title = 'Evaluation Results Report';
            const [rows] = await pool.query(
                `SELECT e.EvaluationID, e.EvaluationDate, e.Status, g.GroupName, p.Title AS ProjectTitle, 
                        m.Title AS MilestoneTitle, 
                        IFNULL(SUM(er.ObtainedMarks), 0) AS TotalObtained, 
                        IFNULL(SUM(ec.MaxMarks), 0) AS TotalMax 
                 FROM evaluation e 
                 JOIN \`groups\` g ON e.GroupID = g.GroupID 
                 JOIN project p ON g.ProjectID = p.ProjectID 
                 JOIN milestone m ON e.MilestoneID = m.MilestoneID 
                 LEFT JOIN evaluation_result er ON e.EvaluationID = er.EvaluationID 
                 LEFT JOIN evaluation_criteria ec ON er.CriteriaID = ec.CriteriaID 
                 GROUP BY e.EvaluationID`
            );
            data = rows;
        } else if (type === 'milestones') {
            title = 'Milestone Completion Report';
            const [rows] = await pool.query(
                `SELECT m.MilestoneID, m.Title, m.DueDate, m.Weightage, m.Status, 
                        COUNT(DISTINCT s.ProjectID) AS CompletedGroups, 
                        (SELECT COUNT(*) FROM \`groups\` WHERE ProjectID IS NOT NULL) AS TotalGroups 
                 FROM milestone m 
                 LEFT JOIN submission s ON m.MilestoneID = s.MilestoneID AND s.Status = 'Reviewed' 
                 GROUP BY m.MilestoneID`
            );
            data = rows;
        } else if (type === 'final') {
            title = 'Final Result Report';
            const [rows] = await pool.query(
                `SELECT s.RegistrationNo, CONCAT(per.FirstName, ' ', IFNULL(per.LastName, '')) AS StudentName, 
                        IFNULL(g.GroupName, 'No Group') AS GroupName, IFNULL(p.Title, 'No Project') AS ProjectTitle,
                        IFNULL(SUM(er.ObtainedMarks), 0) AS TotalObtained,
                        IFNULL(SUM(ec.MaxMarks), 0) AS TotalMax,
                        CASE WHEN IFNULL(SUM(ec.MaxMarks), 0) > 0 
                             THEN ROUND((SUM(er.ObtainedMarks) / SUM(ec.MaxMarks)) * 100, 2) 
                             ELSE 0.00 END AS Percentage
                 FROM student s
                 JOIN person per ON s.StudentID = per.PersonID
                 LEFT JOIN \`groups\` g ON s.GroupID = g.GroupID
                 LEFT JOIN project p ON g.ProjectID = p.ProjectID
                 LEFT JOIN evaluation e ON g.GroupID = e.GroupID AND e.Status = 'Completed'
                 LEFT JOIN evaluation_result er ON e.EvaluationID = er.EvaluationID
                 LEFT JOIN evaluation_criteria ec ON er.CriteriaID = ec.CriteriaID
                 GROUP BY s.StudentID
                 ORDER BY s.RegistrationNo`
            );
            data = rows;
        } else {
            return res.status(400).json({ message: 'Invalid report type' });
        }

        if (format === 'csv') {
            const csv = convertToCSV(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${type}_report.csv"`);
            return res.send(csv);
        } else if (format === 'html') {
            // Generate a beautiful printable HTML page
            const headers = Object.keys(data[0] || {});
            const thHtml = headers.map(h => `<th style="border: 1px solid #ddd; padding: 12px; background-color: #0D9488; color: white; text-align: left;">${h}</th>`).join('');
            const rowsHtml = data.map(row => {
                const tds = headers.map(h => `<td style="border: 1px solid #ddd; padding: 10px;">${row[h] ?? ''}</td>`).join('');
                return `<tr style="border-bottom: 1px solid #ddd;">${tds}</tr>`;
            }).join('');

            const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; margin: 40px; color: #333; }
                    h1 { color: #0D9488; margin-bottom: 5px; }
                    p { color: #666; margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    .print-btn { background-color: #0D9488; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-bottom: 20px; }
                    @media print {
                        .print-btn { display: none; }
                        body { margin: 20px; }
                    }
                </style>
            </head>
            <body>
                <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
                <h1>${title}</h1>
                <p>Report Generated on: ${new Date().toLocaleString()}</p>
                <table>
                    <thead>
                        <tr>${thHtml}</tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </body>
            </html>
            `;
            res.setHeader('Content-Type', 'text/html');
            return res.send(html);
        } else {
            return res.status(400).json({ message: 'Invalid format' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
