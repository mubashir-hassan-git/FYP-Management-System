-- ============================================================
-- Namal FYP Portal – Full Database Schema
-- Includes: Tables, Views, Stored Procedures, Functions, Triggers
-- Database: fyb_db
-- ============================================================

DROP DATABASE IF EXISTS fyb_db;
CREATE DATABASE fyb_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fyb_db;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE department (
    DepartmentID   INT AUTO_INCREMENT PRIMARY KEY,
    DepartmentName VARCHAR(100) NOT NULL UNIQUE,
    Code           VARCHAR(10)  NOT NULL UNIQUE
);

CREATE TABLE batch (
    BatchID      INT AUTO_INCREMENT PRIMARY KEY,
    BatchName    VARCHAR(50) NOT NULL UNIQUE,
    StartYear    YEAR        NOT NULL,
    EndYear      YEAR        NOT NULL,
    DepartmentID INT         NOT NULL,
    FOREIGN KEY (DepartmentID) REFERENCES department(DepartmentID) ON DELETE CASCADE
);

CREATE TABLE person (
    PersonID   INT AUTO_INCREMENT PRIMARY KEY,
    FirstName  VARCHAR(60)  NOT NULL,
    LastName   VARCHAR(60),
    Email      VARCHAR(120) NOT NULL UNIQUE,
    CNIC       VARCHAR(20)  NOT NULL UNIQUE,
    Gender     ENUM('Male','Female','Other') DEFAULT 'Male',
    DOB        DATE,
    PersonType ENUM('Student','Faculty','Evaluator','Coordinator','Admin') NOT NULL DEFAULT 'Student'
);

CREATE TABLE student (
    StudentID      INT PRIMARY KEY,
    RegistrationNo VARCHAR(30) NOT NULL UNIQUE,
    BatchID        INT         NOT NULL,
    GroupID        INT,            -- FK added after groups table
    FOREIGN KEY (StudentID)  REFERENCES person(PersonID) ON DELETE CASCADE,
    FOREIGN KEY (BatchID)    REFERENCES batch(BatchID)
);

CREATE TABLE faculty (
    FacultyID    INT PRIMARY KEY,
    EmployeeNo   VARCHAR(20) NOT NULL UNIQUE,
    Designation  VARCHAR(80),
    DepartmentID INT         NOT NULL,
    FOREIGN KEY (FacultyID)    REFERENCES person(PersonID) ON DELETE CASCADE,
    FOREIGN KEY (DepartmentID) REFERENCES department(DepartmentID)
);

CREATE TABLE project (
    ProjectID     INT AUTO_INCREMENT PRIMARY KEY,
    Title         VARCHAR(200) NOT NULL,
    Description   TEXT,
    Domain        VARCHAR(100),
    ProjectStatus ENUM('Proposal','Active','Completed','On Hold','Cancelled') DEFAULT 'Proposal'
);

CREATE TABLE `groups` (
    GroupID       INT AUTO_INCREMENT PRIMARY KEY,
    GroupName     VARCHAR(80)  NOT NULL UNIQUE,
    CoordinatorID INT,
    ProjectID     INT,
    FOREIGN KEY (CoordinatorID) REFERENCES person(PersonID) ON DELETE SET NULL,
    FOREIGN KEY (ProjectID)     REFERENCES project(ProjectID) ON DELETE SET NULL
);

ALTER TABLE student ADD CONSTRAINT fk_student_group FOREIGN KEY (GroupID) REFERENCES `groups`(GroupID) ON DELETE SET NULL;

CREATE TABLE project_supervision (
    SupervisionID INT AUTO_INCREMENT PRIMARY KEY,
    ProjectID     INT NOT NULL,
    FacultyID     INT NOT NULL,
    Role          ENUM('Supervisor','Co-Supervisor') NOT NULL,
    UNIQUE KEY uq_supervision (ProjectID, FacultyID),
    FOREIGN KEY (ProjectID) REFERENCES project(ProjectID) ON DELETE CASCADE,
    FOREIGN KEY (FacultyID) REFERENCES faculty(FacultyID) ON DELETE CASCADE
);

CREATE TABLE milestone (
    MilestoneID INT AUTO_INCREMENT PRIMARY KEY,
    BatchID     INT         NOT NULL,
    Title       VARCHAR(120) NOT NULL,
    Description TEXT,
    DueDate     DATE        NOT NULL,
    Weightage   DECIMAL(5,2) DEFAULT 0,
    Status      ENUM('Active','Upcoming','Completed','Closed') DEFAULT 'Active',
    FOREIGN KEY (BatchID) REFERENCES batch(BatchID) ON DELETE CASCADE
);

CREATE TABLE submission (
    SubmissionID      INT AUTO_INCREMENT PRIMARY KEY,
    ProjectID         INT NOT NULL,
    MilestoneID       INT NOT NULL,
    SubmissionVersion VARCHAR(10)  DEFAULT 'v1.0',
    SubmissionType    ENUM('Document','Code','Presentation','Zip File') DEFAULT 'Document',
    Status            ENUM('Submitted','Late_Submission','Reviewed','Rejected') DEFAULT 'Submitted',
    SubmittedAt       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ProjectID)   REFERENCES project(ProjectID)   ON DELETE CASCADE,
    FOREIGN KEY (MilestoneID) REFERENCES milestone(MilestoneID) ON DELETE CASCADE
);

CREATE TABLE submission_file (
    FileID       INT AUTO_INCREMENT PRIMARY KEY,
    SubmissionID INT NOT NULL,
    FileName     VARCHAR(200),
    FilePath     VARCHAR(500),
    FileType     VARCHAR(80),
    FileSize     BIGINT,
    FOREIGN KEY (SubmissionID) REFERENCES submission(SubmissionID) ON DELETE CASCADE
);

CREATE TABLE feedback (
    FeedbackID   INT AUTO_INCREMENT PRIMARY KEY,
    SubmissionID INT  NOT NULL,
    FacultyID    INT  NOT NULL,
    Comment      TEXT NOT NULL,
    FeedbackType ENUM('Approved','Revision Required','Rejected','Review') DEFAULT 'Review',
    FeedbackDate DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (SubmissionID) REFERENCES submission(SubmissionID) ON DELETE CASCADE,
    FOREIGN KEY (FacultyID)    REFERENCES faculty(FacultyID) ON DELETE CASCADE
);

CREATE TABLE evaluators (
    EvaluatorID   INT AUTO_INCREMENT PRIMARY KEY,
    PersonID      INT NOT NULL UNIQUE,
    EvaluatorType ENUM('Internal','External') DEFAULT 'Internal',
    Affiliation   VARCHAR(120),
    FOREIGN KEY (PersonID) REFERENCES person(PersonID) ON DELETE CASCADE
);

CREATE TABLE evaluation (
    EvaluationID   INT AUTO_INCREMENT PRIMARY KEY,
    MilestoneID    INT  NOT NULL,
    GroupID        INT  NOT NULL,
    EvaluationDate DATE NOT NULL,
    Status         ENUM('Scheduled','In Progress','Completed','Cancelled') DEFAULT 'Scheduled',
    FOREIGN KEY (MilestoneID) REFERENCES milestone(MilestoneID) ON DELETE CASCADE,
    FOREIGN KEY (GroupID)     REFERENCES `groups`(GroupID) ON DELETE CASCADE
);

CREATE TABLE evaluation_assignment (
    AssignmentID  INT AUTO_INCREMENT PRIMARY KEY,
    EvaluationID  INT NOT NULL,
    EvaluatorID   INT NOT NULL,
    EvaluatorRole ENUM('Internal Evaluator','External Evaluator') DEFAULT 'Internal Evaluator',
    AssignedDate  DATE DEFAULT (CURRENT_DATE),
    UNIQUE KEY uq_eval_assign (EvaluationID, EvaluatorID),
    FOREIGN KEY (EvaluationID) REFERENCES evaluation(EvaluationID) ON DELETE CASCADE,
    FOREIGN KEY (EvaluatorID)  REFERENCES evaluators(EvaluatorID) ON DELETE CASCADE
);

CREATE TABLE evaluation_criteria (
    CriteriaID   INT AUTO_INCREMENT PRIMARY KEY,
    EvaluationID INT          NOT NULL,
    CriteriaName VARCHAR(120) NOT NULL,
    MaxMarks     DECIMAL(6,2) NOT NULL,
    Description  TEXT,
    FOREIGN KEY (EvaluationID) REFERENCES evaluation(EvaluationID) ON DELETE CASCADE
);

CREATE TABLE evaluation_result (
    ResultID      INT AUTO_INCREMENT PRIMARY KEY,
    EvaluationID  INT          NOT NULL,
    CriteriaID    INT          NOT NULL,
    ObtainedMarks DECIMAL(6,2) NOT NULL DEFAULT 0,
    Remarks       TEXT,
    UNIQUE KEY uq_result (EvaluationID, CriteriaID),
    FOREIGN KEY (EvaluationID) REFERENCES evaluation(EvaluationID) ON DELETE CASCADE,
    FOREIGN KEY (CriteriaID)   REFERENCES evaluation_criteria(CriteriaID) ON DELETE CASCADE
);

CREATE TABLE role (
    RoleID   INT AUTO_INCREMENT PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE user_account (
    AccountID  INT AUTO_INCREMENT PRIMARY KEY,
    Username   VARCHAR(80)  NOT NULL UNIQUE,
    Password   VARCHAR(255) NOT NULL,
    Status     ENUM('Active','Inactive','Suspended') DEFAULT 'Active',
    PersonID   INT NOT NULL UNIQUE,
    CreatedAt  DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastLogin  DATETIME,
    FOREIGN KEY (PersonID) REFERENCES person(PersonID) ON DELETE CASCADE
);

CREATE TABLE useraccount_role (
    ID        INT AUTO_INCREMENT PRIMARY KEY,
    AccountID INT NOT NULL,
    RoleID    INT NOT NULL,
    UNIQUE KEY uq_accrole (AccountID, RoleID),
    FOREIGN KEY (AccountID) REFERENCES user_account(AccountID) ON DELETE CASCADE,
    FOREIGN KEY (RoleID)    REFERENCES role(RoleID) ON DELETE CASCADE
);

-- Audit log for tracking important changes
CREATE TABLE audit_log (
    LogID      INT AUTO_INCREMENT PRIMARY KEY,
    TableName  VARCHAR(60)  NOT NULL,
    RecordID   INT          NOT NULL,
    Action     ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    ChangedBy  VARCHAR(80),
    ChangeDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    OldData    TEXT,
    NewData    TEXT
);

-- ============================================================
-- VIEW: Student Milestone Dashboard
-- ============================================================

CREATE OR REPLACE VIEW view_student_milestone_dashboards AS
SELECT
    g.GroupName          AS AssignedGroup,
    m.Title              AS MilestoneName,
    m.DueDate            AS Deadline,
    COALESCE(s.Status, 'PENDING')         AS SubmissionStatus,
    COALESCE(sf.FileName, 'No File')      AS AttachedFile,
    COALESCE(s.SubmissionVersion, '-')    AS Version
FROM `groups` g
JOIN student st    ON st.GroupID   = g.GroupID
JOIN batch b       ON st.BatchID   = b.BatchID
JOIN milestone m   ON m.BatchID    = b.BatchID
LEFT JOIN submission s ON s.ProjectID = g.ProjectID AND s.MilestoneID = m.MilestoneID
LEFT JOIN submission_file sf ON sf.SubmissionID = s.SubmissionID
GROUP BY g.GroupName, m.MilestoneID;

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

DELIMITER $$

-- SP: Register a new student (person + student + account + role)
CREATE PROCEDURE sp_register_student(
    IN p_firstName     VARCHAR(60),
    IN p_lastName      VARCHAR(60),
    IN p_email         VARCHAR(120),
    IN p_cnic          VARCHAR(20),
    IN p_gender        VARCHAR(10),
    IN p_dob           DATE,
    IN p_registrationNo VARCHAR(30),
    IN p_batchId       INT,
    IN p_password      VARCHAR(255)
)
BEGIN
    DECLARE personId INT;
    DECLARE accountId INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    INSERT INTO person (FirstName, LastName, Email, CNIC, Gender, DOB, PersonType)
    VALUES (p_firstName, p_lastName, p_email, p_cnic, p_gender, p_dob, 'Student');
    SET personId = LAST_INSERT_ID();

    INSERT INTO student (StudentID, RegistrationNo, BatchID, GroupID)
    VALUES (personId, p_registrationNo, p_batchId, NULL);

    INSERT INTO user_account (Username, Password, Status, PersonID)
    VALUES (LOWER(SUBSTRING_INDEX(p_email, '@', 1)), p_password, 'Active', personId);
    SET accountId = LAST_INSERT_ID();

    INSERT INTO useraccount_role (AccountID, RoleID) VALUES (accountId, 1); -- Role 1 = Student

    COMMIT;
    SELECT personId AS StudentID;
END$$

-- SP: Register a new faculty member
CREATE PROCEDURE sp_register_faculty(
    IN p_firstName   VARCHAR(60),
    IN p_lastName    VARCHAR(60),
    IN p_email       VARCHAR(120),
    IN p_cnic        VARCHAR(20),
    IN p_gender      VARCHAR(10),
    IN p_dob         DATE,
    IN p_employeeNo  VARCHAR(20),
    IN p_designation VARCHAR(80),
    IN p_deptId      INT,
    IN p_password    VARCHAR(255)
)
BEGIN
    DECLARE personId INT;
    DECLARE accountId INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    INSERT INTO person (FirstName, LastName, Email, CNIC, Gender, DOB, PersonType)
    VALUES (p_firstName, p_lastName, p_email, p_cnic, p_gender, p_dob, 'Faculty');
    SET personId = LAST_INSERT_ID();

    INSERT INTO faculty (FacultyID, EmployeeNo, Designation, DepartmentID)
    VALUES (personId, p_employeeNo, p_designation, p_deptId);

    INSERT INTO user_account (Username, Password, Status, PersonID)
    VALUES (LOWER(SUBSTRING_INDEX(p_email, '@', 1)), p_password, 'Active', personId);
    SET accountId = LAST_INSERT_ID();

    INSERT INTO useraccount_role (AccountID, RoleID) VALUES (accountId, 2); -- Role 2 = Faculty

    COMMIT;
    SELECT personId AS FacultyID;
END$$

-- SP: Create a group (validates 2 ungrouped students)
CREATE PROCEDURE sp_create_group(
    IN p_groupName    VARCHAR(80),
    IN p_coordinatorId INT,
    IN p_studentId1   INT,
    IN p_studentId2   INT
)
BEGIN
    DECLARE groupId INT;
    DECLARE already_grouped INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_studentId1 = p_studentId2 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A group must contain 2 distinct students';
    END IF;

    SELECT COUNT(*) INTO already_grouped
    FROM student WHERE StudentID IN (p_studentId1, p_studentId2) AND GroupID IS NOT NULL;

    IF already_grouped > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'One or both students are already in a group';
    END IF;

    START TRANSACTION;

    INSERT INTO `groups` (GroupName, CoordinatorID, ProjectID) VALUES (p_groupName, p_coordinatorId, NULL);
    SET groupId = LAST_INSERT_ID();

    UPDATE student SET GroupID = groupId WHERE StudentID IN (p_studentId1, p_studentId2);

    COMMIT;
    SELECT groupId AS GroupID;
END$$

-- SP: Assign supervisors to a project
CREATE PROCEDURE sp_assign_supervisors(
    IN p_projectId     INT,
    IN p_supervisorId  INT,
    IN p_coSupervisorId INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    IF p_supervisorId = p_coSupervisorId AND p_coSupervisorId IS NOT NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Supervisor and Co-Supervisor cannot be the same person';
    END IF;

    START TRANSACTION;

    DELETE FROM project_supervision WHERE ProjectID = p_projectId;

    INSERT INTO project_supervision (ProjectID, FacultyID, Role)
    VALUES (p_projectId, p_supervisorId, 'Supervisor');

    IF p_coSupervisorId IS NOT NULL THEN
        INSERT INTO project_supervision (ProjectID, FacultyID, Role)
        VALUES (p_projectId, p_coSupervisorId, 'Co-Supervisor');
    END IF;

    COMMIT;
    SELECT 'Supervisors assigned' AS Result;
END$$

-- SP: Record evaluation marks
CREATE PROCEDURE sp_record_marks(
    IN p_evaluationId INT,
    IN p_criteriaId   INT,
    IN p_obtained     DECIMAL(6,2),
    IN p_remarks      TEXT
)
BEGIN
    DECLARE v_max DECIMAL(6,2);
    DECLARE v_criteriaName VARCHAR(120);

    SELECT MaxMarks, CriteriaName INTO v_max, v_criteriaName
    FROM evaluation_criteria WHERE CriteriaID = p_criteriaId;

    IF p_obtained > v_max THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = CONCAT('Obtained marks exceed maximum for: ', v_criteriaName);
    END IF;

    INSERT INTO evaluation_result (EvaluationID, CriteriaID, ObtainedMarks, Remarks)
    VALUES (p_evaluationId, p_criteriaId, p_obtained, p_remarks)
    ON DUPLICATE KEY UPDATE ObtainedMarks = p_obtained, Remarks = p_remarks;
END$$

-- SP: Get student profile data
CREATE PROCEDURE sp_get_student_profile(IN p_studentId INT)
BEGIN
    SELECT
        p.PersonID, p.FirstName, p.LastName, p.Email, p.CNIC, p.Gender, p.DOB,
        s.RegistrationNo, b.BatchName, g.GroupName,
        ua.Username, ua.Status AS AccountStatus, ua.LastLogin
    FROM person p
    JOIN student s ON p.PersonID = s.StudentID
    JOIN batch b   ON s.BatchID  = b.BatchID
    LEFT JOIN `groups` g ON s.GroupID = g.GroupID
    JOIN user_account ua ON ua.PersonID = p.PersonID
    WHERE p.PersonID = p_studentId;
END$$

-- SP: Get faculty profile data
CREATE PROCEDURE sp_get_faculty_profile(IN p_facultyId INT)
BEGIN
    SELECT
        p.PersonID, p.FirstName, p.LastName, p.Email, p.CNIC, p.Gender, p.DOB,
        f.EmployeeNo, f.Designation, d.DepartmentName,
        ua.Username, ua.Status AS AccountStatus, ua.LastLogin
    FROM person p
    JOIN faculty f     ON p.PersonID  = f.FacultyID
    JOIN department d  ON f.DepartmentID = d.DepartmentID
    JOIN user_account ua ON ua.PersonID = p.PersonID
    WHERE p.PersonID = p_facultyId;
END$$

-- SP: Update user profile (non-permanent fields only)
CREATE PROCEDURE sp_update_profile(
    IN p_personId  INT,
    IN p_firstName VARCHAR(60),
    IN p_lastName  VARCHAR(60),
    IN p_gender    VARCHAR(10),
    IN p_dob       DATE
)
BEGIN
    UPDATE person
    SET FirstName = p_firstName,
        LastName  = p_lastName,
        Gender    = p_gender,
        DOB       = p_dob
    WHERE PersonID = p_personId;
END$$

-- SP: Change account password
CREATE PROCEDURE sp_change_password(
    IN p_personId   INT,
    IN p_newPassHash VARCHAR(255)
)
BEGIN
    UPDATE user_account SET Password = p_newPassHash WHERE PersonID = p_personId;
END$$

-- SP: Admin - toggle user account status
CREATE PROCEDURE sp_toggle_account_status(
    IN p_personId INT,
    IN p_status   VARCHAR(20)
)
BEGIN
    UPDATE user_account SET Status = p_status WHERE PersonID = p_personId;
    INSERT INTO audit_log (TableName, RecordID, Action, ChangedBy, NewData)
    VALUES ('user_account', p_personId, 'UPDATE', 'superadmin', CONCAT('Status changed to ', p_status));
END$$

-- SP: System statistics for super admin
CREATE PROCEDURE sp_system_stats()
BEGIN
    SELECT
        (SELECT COUNT(*) FROM student)                          AS total_students,
        (SELECT COUNT(*) FROM faculty)                          AS total_faculty,
        (SELECT COUNT(*) FROM evaluators)                       AS total_evaluators,
        (SELECT COUNT(*) FROM `groups`)                         AS total_groups,
        (SELECT COUNT(*) FROM project)                          AS total_projects,
        (SELECT COUNT(*) FROM milestone)                        AS total_milestones,
        (SELECT COUNT(*) FROM submission)                       AS total_submissions,
        (SELECT COUNT(*) FROM user_account WHERE Status='Active') AS active_accounts,
        (SELECT COUNT(*) FROM user_account WHERE Status='Suspended') AS suspended_accounts;
END$$

DELIMITER ;

-- ============================================================
-- FUNCTIONS
-- ============================================================

DELIMITER $$

-- Function: Get full name of a person
CREATE FUNCTION fn_full_name(p_personId INT)
RETURNS VARCHAR(125)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_name VARCHAR(125);
    SELECT CONCAT(FirstName, ' ', IFNULL(LastName, '')) INTO v_name
    FROM person WHERE PersonID = p_personId;
    RETURN TRIM(v_name);
END$$

-- Function: Calculate percentage score for an evaluation
CREATE FUNCTION fn_eval_percentage(p_evaluationId INT)
RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_obtained DECIMAL(10,2);
    DECLARE v_max      DECIMAL(10,2);

    SELECT SUM(er.ObtainedMarks), SUM(ec.MaxMarks)
    INTO v_obtained, v_max
    FROM evaluation_result er
    JOIN evaluation_criteria ec ON er.CriteriaID = ec.CriteriaID
    WHERE er.EvaluationID = p_evaluationId;

    IF v_max IS NULL OR v_max = 0 THEN
        RETURN 0.00;
    END IF;
    RETURN ROUND((v_obtained / v_max) * 100, 2);
END$$

-- Function: Count submissions for a project
CREATE FUNCTION fn_submission_count(p_projectId INT)
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_count INT;
    SELECT COUNT(*) INTO v_count FROM submission WHERE ProjectID = p_projectId;
    RETURN v_count;
END$$

-- Function: Get milestone progress % for a group
CREATE FUNCTION fn_group_progress(p_groupId INT)
RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_total     INT DEFAULT 0;
    DECLARE v_completed INT DEFAULT 0;
    DECLARE v_batchId   INT;
    DECLARE v_projectId INT;

    SELECT b.BatchID, g.ProjectID INTO v_batchId, v_projectId
    FROM `groups` g
    JOIN student s ON s.GroupID = g.GroupID
    JOIN batch b   ON s.BatchID = b.BatchID
    WHERE g.GroupID = p_groupId LIMIT 1;

    IF v_batchId IS NULL THEN RETURN 0.00; END IF;

    SELECT COUNT(*) INTO v_total FROM milestone WHERE BatchID = v_batchId;

    SELECT COUNT(DISTINCT MilestoneID) INTO v_completed
    FROM submission
    WHERE ProjectID = v_projectId AND Status = 'Reviewed';

    IF v_total = 0 THEN RETURN 0.00; END IF;
    RETURN ROUND((v_completed / v_total) * 100, 2);
END$$

DELIMITER ;

-- ============================================================
-- TRIGGERS
-- ============================================================

DELIMITER $$

-- Trigger: Auto-set submission version on new submission AND check milestone status AND late submission
CREATE TRIGGER trg_before_insert_submission
BEFORE INSERT ON submission
FOR EACH ROW
BEGIN
    DECLARE v_count  INT;
    DECLARE v_status VARCHAR(20);
    DECLARE v_due    DATE;

    -- Check milestone is Active
    SELECT Status, DueDate INTO v_status, v_due
    FROM milestone WHERE MilestoneID = NEW.MilestoneID;

    IF v_status NOT IN ('Active') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot submit to a milestone that is not Active';
    END IF;

    -- Auto version
    SELECT COUNT(*) INTO v_count
    FROM submission
    WHERE ProjectID = NEW.ProjectID AND MilestoneID = NEW.MilestoneID;
    SET NEW.SubmissionVersion = CONCAT('v', (v_count + 1), '.0');

    -- Late submission flag
    IF v_due IS NOT NULL AND CURRENT_DATE > v_due THEN
        SET NEW.Status = 'Late_Submission';
    END IF;
END$$

-- Trigger: Audit log on user account status change
CREATE TRIGGER trg_after_update_user_status
AFTER UPDATE ON user_account
FOR EACH ROW
BEGIN
    IF OLD.Status <> NEW.Status THEN
        INSERT INTO audit_log (TableName, RecordID, Action, ChangedBy, OldData, NewData)
        VALUES ('user_account', NEW.AccountID, 'UPDATE', 'system',
                CONCAT('Status: ', OLD.Status),
                CONCAT('Status: ', NEW.Status));
    END IF;
END$$

-- Trigger: Audit log when student is deleted
CREATE TRIGGER trg_after_delete_person
AFTER DELETE ON person
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (TableName, RecordID, Action, ChangedBy, OldData)
    VALUES ('person', OLD.PersonID, 'DELETE', 'system',
            CONCAT(OLD.FirstName, ' ', IFNULL(OLD.LastName,''), ' (', OLD.PersonType, ')'));
END$$

DELIMITER ;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Roles
INSERT INTO role (RoleName) VALUES ('Student'), ('Faculty'), ('Coordinator'), ('SuperAdmin');

-- Departments
INSERT INTO department (DepartmentName, Code) VALUES
('Computer Science', 'CS'),
('Software Engineering', 'SE'),
('Electrical Engineering', 'EE'),
('Management Sciences', 'MS');

-- Batches
INSERT INTO batch (BatchName, StartYear, EndYear, DepartmentID) VALUES
('CS-2021', 2021, 2025, 1),
('CS-2022', 2022, 2026, 1),
('SE-2021', 2021, 2025, 2),
('SE-2022', 2022, 2026, 2),
('EE-2021', 2021, 2025, 3);

-- Persons (coordinator, faculty, evaluators, students, super admin)
-- PersonType Admin = super admin
INSERT INTO person (FirstName, LastName, Email, CNIC, Gender, DOB, PersonType) VALUES
-- Super Admin
('Super', 'Admin',     'admin@namal.edu.pk',           '35201-0000001-1', 'Male',   '1980-01-01', 'Admin'),
-- Coordinator
('Muhammad', 'Imran',  'muhammad.imran@namal.edu.pk',  '35201-0000002-1', 'Male',   '1975-03-15', 'Coordinator'),
-- Faculty (8)
('Ayesha',   'Siddiqua','ayesha.siddiqua@namal.edu.pk','35201-1111111-1', 'Female', '1982-06-20', 'Faculty'),
('Usman',    'Mansoor', 'usman.mansoor@namal.edu.pk',  '35201-2222222-1', 'Male',   '1978-09-10', 'Faculty'),
('Sara',     'Ahmed',   'sara.ahmed@namal.edu.pk',     '35201-3333333-1', 'Female', '1985-02-28', 'Faculty'),
('Khalid',   'Malik',   'khalid.malik@namal.edu.pk',   '35201-4444444-1', 'Male',   '1979-11-05', 'Faculty'),
('Nadia',    'Hussain', 'nadia.hussain@namal.edu.pk',  '35201-5555555-1', 'Female', '1983-07-14', 'Faculty'),
('Tariq',    'Mahmood', 'tariq.mahmood@namal.edu.pk',  '35201-6666666-1', 'Male',   '1976-04-22', 'Faculty'),
('Fatima',   'Zahra',   'fatima.zahra@namal.edu.pk',   '35201-7777777-1', 'Female', '1987-12-01', 'Faculty'),
('Bilal',    'Chaudhry','bilal.chaudhry@namal.edu.pk', '35201-8888888-1', 'Male',   '1980-08-30', 'Faculty'),
-- External Evaluator
('Dr. Amjad','Hussain', 'amjad.hussain@external.org',  '35201-9999999-1', 'Male',   '1970-05-18', 'Evaluator'),
-- Students (20)
('Ali',      'Raza',    'ali.raza@student.namal.edu.pk',         '35201-1000001-1', 'Male',   '2001-03-10', 'Student'),
('Zara',     'Malik',   'zara.malik@student.namal.edu.pk',       '35201-1000002-1', 'Female', '2001-07-22', 'Student'),
('Omar',     'Farooq',  'omar.farooq@student.namal.edu.pk',      '35201-1000003-1', 'Male',   '2000-11-05', 'Student'),
('Sana',     'Baig',    'sana.baig@student.namal.edu.pk',        '35201-1000004-1', 'Female', '2001-01-30', 'Student'),
('Hamza',    'Iqbal',   'hamza.iqbal@student.namal.edu.pk',      '35201-1000005-1', 'Male',   '2000-09-14', 'Student'),
('Ayesha',   'Khan',    'ayesha.khan@student.namal.edu.pk',      '35201-1000006-1', 'Female', '2001-05-19', 'Student'),
('Imran',    'Tariq',   'imran.tariq@student.namal.edu.pk',      '35201-1000007-1', 'Male',   '2000-12-03', 'Student'),
('Mariam',   'Yousuf',  'mariam.yousuf@student.namal.edu.pk',    '35201-1000008-1', 'Female', '2001-08-27', 'Student'),
('Faisal',   'Nawaz',   'faisal.nawaz@student.namal.edu.pk',     '35201-1000009-1', 'Male',   '2000-04-16', 'Student'),
('Hira',     'Shah',    'hira.shah@student.namal.edu.pk',        '35201-1000010-1', 'Female', '2001-02-11', 'Student'),
('Hassan',   'Mirza',   'hassan.mirza@student.namal.edu.pk',     '35201-1000011-1', 'Male',   '2000-06-25', 'Student'),
('Noor',     'Javed',   'noor.javed@student.namal.edu.pk',       '35201-1000012-1', 'Female', '2001-10-08', 'Student'),
('Usman',    'Ali',     'usman.ali@student.namal.edu.pk',        '35201-1000013-1', 'Male',   '2000-03-20', 'Student'),
('Sadia',    'Rehman',  'sadia.rehman@student.namal.edu.pk',     '35201-1000014-1', 'Female', '2001-09-12', 'Student'),
('Bilal',    'Hussain', 'bilal.hussain@student.namal.edu.pk',    '35201-1000015-1', 'Male',   '2000-07-04', 'Student'),
('Amna',     'Qadir',   'amna.qadir@student.namal.edu.pk',       '35201-1000016-1', 'Female', '2001-04-28', 'Student'),
('Kashif',   'Mehmood', 'kashif.mehmood@student.namal.edu.pk',   '35201-1000017-1', 'Male',   '2000-01-17', 'Student'),
('Rabia',    'Aslam',   'rabia.aslam@student.namal.edu.pk',      '35201-1000018-1', 'Female', '2001-06-06', 'Student'),
('Saad',     'Latif',   'saad.latif@student.namal.edu.pk',       '35201-1000019-1', 'Male',   '2000-08-23', 'Student'),
('Zainab',   'Anwar',   'zainab.anwar@student.namal.edu.pk',     '35201-1000020-1', 'Female', '2001-12-15', 'Student');

-- Faculty table entries (PersonID 3-10 = faculty, PersonID 2 = coordinator treated as faculty too for supervision)
INSERT INTO faculty (FacultyID, EmployeeNo, Designation, DepartmentID) VALUES
(2,  'EMP-001', 'FYP Coordinator',        1),
(3,  'EMP-002', 'Associate Professor',    1),
(4,  'EMP-003', 'Professor',              1),
(5,  'EMP-004', 'Assistant Professor',    1),
(6,  'EMP-005', 'Senior Lecturer',        2),
(7,  'EMP-006', 'Associate Professor',    2),
(8,  'EMP-007', 'Lecturer',               1),
(9,  'EMP-008', 'Assistant Professor',    2),
(10, 'EMP-009', 'Senior Lecturer',        3);

-- Evaluators
INSERT INTO evaluators (PersonID, EvaluatorType, Affiliation) VALUES
(3,  'Internal', 'Namal University'),
(4,  'Internal', 'Namal University'),
(5,  'Internal', 'Namal University'),
(11, 'External', 'COMSATS University');

-- Students
INSERT INTO student (StudentID, RegistrationNo, BatchID) VALUES
(12, '21F-CS-001', 1),
(13, '21F-CS-002', 1),
(14, '21F-CS-003', 1),
(15, '21F-CS-004', 1),
(16, '21F-CS-005', 1),
(17, '21F-CS-006', 1),
(18, '21F-CS-007', 1),
(19, '21F-CS-008', 1),
(20, '21F-CS-009', 1),
(21, '21F-CS-010', 1),
(22, '22F-CS-001', 2),
(23, '22F-CS-002', 2),
(24, '22F-CS-003', 2),
(25, '22F-CS-004', 2),
(26, '22F-SE-001', 3),
(27, '22F-SE-002', 3),
(28, '21F-SE-001', 3),
(29, '21F-SE-002', 3),
(30, '21F-SE-003', 3),
(31, '21F-CS-011', 1);

-- Projects
INSERT INTO project (Title, Description, Domain, ProjectStatus) VALUES
('AI-Powered Exam Proctoring System',   'Remote exam monitoring using facial recognition and AI.', 'Artificial Intelligence', 'Active'),
('Blockchain-Based Certificate Verification', 'Tamper-proof academic credential system.', 'Blockchain', 'Active'),
('Smart Campus IoT Network',            'IoT sensors for energy monitoring and security.', 'IoT', 'Active'),
('Cybersecurity Threat Detection ML',   'Machine learning model to detect network intrusions.', 'Cybersecurity', 'Active'),
('E-Health Patient Portal',             'Web platform for patient-doctor interactions.', 'Healthcare IT', 'Active'),
('Autonomous Drone Navigation',         'Computer vision-based obstacle avoidance for drones.', 'Computer Vision', 'Proposal'),
('NLP Urdu Sentiment Analyzer',         'Sentiment analysis for Urdu social media posts.', 'Natural Language Processing', 'Active'),
('AR Campus Navigation App',            'Augmented reality indoor navigation system.', 'Augmented Reality', 'Proposal'),
('Federated Learning for Healthcare',   'Privacy-preserving distributed ML for medical data.', 'Federated Learning', 'Active'),
('Smart Water Management System',       'Real-time water usage monitoring and prediction.', 'IoT', 'Active');

-- Groups
INSERT INTO `groups` (GroupName, CoordinatorID, ProjectID) VALUES
('GRP-CS-01', 2, 1),
('GRP-CS-02', 2, 2),
('GRP-CS-03', 2, 3),
('GRP-CS-04', 2, 4),
('GRP-CS-05', 2, 5),
('GRP-CS-06', 2, 7),
('GRP-CS-07', 2, 9),
('GRP-CS-08', 2, 10),
('GRP-SE-01', 2, 6),
('GRP-SE-02', 2, 8);

-- Assign students to groups
UPDATE student SET GroupID = 1  WHERE StudentID IN (12, 13);
UPDATE student SET GroupID = 2  WHERE StudentID IN (14, 15);
UPDATE student SET GroupID = 3  WHERE StudentID IN (16, 17);
UPDATE student SET GroupID = 4  WHERE StudentID IN (18, 19);
UPDATE student SET GroupID = 5  WHERE StudentID IN (20, 21);
UPDATE student SET GroupID = 6  WHERE StudentID IN (22, 23);
UPDATE student SET GroupID = 7  WHERE StudentID IN (24, 25);
UPDATE student SET GroupID = 8  WHERE StudentID IN (26, 27);
UPDATE student SET GroupID = 9  WHERE StudentID IN (28, 29);
UPDATE student SET GroupID = 10 WHERE StudentID IN (30, 31);

-- Supervision assignments
INSERT INTO project_supervision (ProjectID, FacultyID, Role) VALUES
(1,  3, 'Supervisor'),   (1,  4, 'Co-Supervisor'),
(2,  4, 'Supervisor'),   (2,  5, 'Co-Supervisor'),
(3,  5, 'Supervisor'),   (3,  6, 'Co-Supervisor'),
(4,  6, 'Supervisor'),   (4,  3, 'Co-Supervisor'),
(5,  7, 'Supervisor'),   (5,  8, 'Co-Supervisor'),
(6,  9, 'Supervisor'),
(7,  3, 'Supervisor'),   (7,  7, 'Co-Supervisor'),
(8, 10, 'Supervisor'),
(9,  4, 'Supervisor'),   (9,  9, 'Co-Supervisor'),
(10, 6, 'Supervisor'),   (10, 8, 'Co-Supervisor');

-- Milestones for Batch CS-2021 (BatchID=1)
INSERT INTO milestone (BatchID, Title, Description, DueDate, Weightage, Status) VALUES
(1, 'Project Proposal',         'Submit the initial FYP project proposal document.',        '2024-10-15', 10, 'Completed'),
(1, 'Literature Review',        'Submit comprehensive literature survey and related works.', '2024-12-01', 15, 'Completed'),
(1, 'Prototype Development',    'Working prototype with basic functionality demonstrated.', '2025-02-28', 25, 'Completed'),
(1, 'Mid-Project Evaluation',   'Mid-term evaluation with supervisor panel.',                '2025-04-30', 20, 'Active'),
(1, 'Final Implementation',     'Complete system with all features implemented.',            '2025-06-30', 20, 'Upcoming'),
(1, 'Final Defense',            'Presentation and defense before evaluation committee.',     '2025-07-15', 10, 'Upcoming');

-- Milestones for Batch CS-2022 (BatchID=2)
INSERT INTO milestone (BatchID, Title, Description, DueDate, Weightage, Status) VALUES
(2, 'Project Proposal',     'Initial project concept and feasibility study.',               '2025-03-01', 10, 'Completed'),
(2, 'Literature Review',    'Survey of existing systems and academic literature.',           '2025-05-01', 15, 'Active'),
(2, 'Prototype Demo',       'Basic working prototype demonstration to supervisor.',          '2025-09-01', 25, 'Upcoming');

-- Submissions (for Batch 1 groups)
INSERT INTO submission (ProjectID, MilestoneID, SubmissionType, Status, SubmittedAt) VALUES
-- GRP-CS-01 (ProjectID=1)
(1, 1, 'Document',     'Reviewed',   '2024-10-10 10:30:00'),
(1, 2, 'Document',     'Reviewed',   '2024-11-28 14:00:00'),
(1, 3, 'Code',         'Reviewed',   '2025-02-25 11:00:00'),
(1, 4, 'Presentation', 'Submitted',  '2025-04-20 09:00:00'),
-- GRP-CS-02 (ProjectID=2)
(2, 1, 'Document',     'Reviewed',   '2024-10-12 09:15:00'),
(2, 2, 'Document',     'Reviewed',   '2024-11-30 16:00:00'),
(2, 3, 'Code',         'Reviewed',   '2025-02-27 13:00:00'),
-- GRP-CS-03 (ProjectID=3)
(3, 1, 'Document',     'Reviewed',   '2024-10-14 08:45:00'),
(3, 2, 'Document',     'Reviewed',   '2024-12-01 10:00:00'),
(3, 3, 'Code',         'Submitted',  '2025-02-26 15:30:00'),
-- GRP-CS-04 (ProjectID=4)
(4, 1, 'Document',     'Reviewed',   '2024-10-11 11:00:00'),
(4, 2, 'Document',     'Reviewed',   '2024-11-29 12:00:00'),
-- GRP-CS-05 (ProjectID=5)
(5, 1, 'Document',     'Reviewed',   '2024-10-13 14:00:00'),
(5, 2, 'Document',     'Submitted',  '2024-12-05 10:30:00');

-- Feedback entries
INSERT INTO feedback (SubmissionID, FacultyID, Comment, FeedbackType, FeedbackDate) VALUES
(1, 3, 'Good proposal structure. Strengthen the problem statement with more data.',                 'Approved',          '2024-10-18'),
(2, 3, 'Literature review is comprehensive. Add 3 more recent papers from 2023.',                   'Revision Required', '2024-12-05'),
(3, 3, 'Prototype is functional. Clean up the code and improve UI for the next milestone.',         'Approved',          '2025-03-02'),
(5, 4, 'Well-written proposal. Blockchain integration plan is clear.',                              'Approved',          '2024-10-16'),
(6, 4, 'Good literature coverage. Ensure consistency in citation format.',                          'Approved',          '2024-12-04'),
(7, 4, 'Prototype works as expected. Add error handling and unit tests before next phase.',         'Revision Required', '2025-03-01'),
(8, 5, 'Proposal approved. Define hardware requirements in more detail.',                           'Approved',          '2024-10-17'),
(9, 5, 'Good review. Include more IoT-specific papers.',                                            'Revision Required', '2024-12-07'),
(11, 6, 'Proposal is solid. Cybersecurity threat model needs expansion.',                           'Approved',          '2024-10-14'),
(12, 6, 'Literature is adequate. Cite NIST guidelines in your methodology.',                        'Approved',          '2024-12-03'),
(13, 7, 'Health portal proposal accepted. Ensure HIPAA compliance considerations.',                 'Approved',          '2024-10-15');

-- Evaluations
INSERT INTO evaluation (MilestoneID, GroupID, EvaluationDate, Status) VALUES
(1, 1, '2024-10-20', 'Completed'),
(1, 2, '2024-10-21', 'Completed'),
(1, 3, '2024-10-22', 'Completed'),
(3, 1, '2025-03-05', 'Completed'),
(3, 2, '2025-03-06', 'Completed'),
(4, 1, '2025-05-01', 'Scheduled'),
(4, 2, '2025-05-02', 'Scheduled'),
(4, 3, '2025-05-03', 'Scheduled');

-- Evaluation assignments
INSERT INTO evaluation_assignment (EvaluationID, EvaluatorID, EvaluatorRole, AssignedDate) VALUES
(1, 1, 'Internal Evaluator', '2024-10-18'),
(1, 2, 'Internal Evaluator', '2024-10-18'),
(2, 1, 'Internal Evaluator', '2024-10-18'),
(2, 3, 'Internal Evaluator', '2024-10-18'),
(3, 2, 'Internal Evaluator', '2024-10-18'),
(3, 3, 'Internal Evaluator', '2024-10-18'),
(4, 1, 'Internal Evaluator', '2025-03-01'),
(4, 4, 'External Evaluator', '2025-03-01'),
(5, 2, 'Internal Evaluator', '2025-03-01'),
(5, 4, 'External Evaluator', '2025-03-01'),
(6, 1, 'Internal Evaluator', '2025-04-20'),
(7, 2, 'Internal Evaluator', '2025-04-20'),
(8, 3, 'Internal Evaluator', '2025-04-20');

-- Evaluation criteria
INSERT INTO evaluation_criteria (EvaluationID, CriteriaName, MaxMarks, Description) VALUES
-- Eval 1 (proposal)
(1, 'Problem Identification', 10, 'Clarity and significance of the identified problem'),
(1, 'Literature Review',      10, 'Breadth and quality of referenced work'),
(1, 'Methodology',            10, 'Technical approach and feasibility'),
-- Eval 2
(2, 'Problem Identification', 10, 'Clarity and significance of the identified problem'),
(2, 'Literature Review',      10, 'Breadth and quality of referenced work'),
(2, 'Methodology',            10, 'Technical approach and feasibility'),
-- Eval 3
(3, 'Problem Identification', 10, 'Clarity and significance of the identified problem'),
(3, 'Literature Review',      10, 'Breadth and quality of referenced work'),
(3, 'Methodology',            10, 'Technical approach and feasibility'),
-- Eval 4 (prototype)
(4, 'Functionality',           25, 'System works as specified'),
(4, 'Code Quality',            15, 'Clean, documented, modular code'),
(4, 'UI/UX Design',            10, 'User experience quality'),
-- Eval 5
(5, 'Functionality',           25, 'System works as specified'),
(5, 'Code Quality',            15, 'Clean, documented, modular code'),
(5, 'UI/UX Design',            10, 'User experience quality');

-- Evaluation results for completed evaluations
INSERT INTO evaluation_result (EvaluationID, CriteriaID, ObtainedMarks, Remarks) VALUES
(1, 1, 9,  'Excellent problem statement'),
(1, 2, 8,  'Good coverage'),
(1, 3, 7.5,'Feasible methodology'),
(2, 4, 8,  'Clear problem scope'),
(2, 5, 9,  'Strong literature base'),
(2, 6, 8.5,'Solid methodology'),
(3, 7, 7,  'Problem identified correctly'),
(3, 8, 8,  'Good references'),
(3, 9, 7,  'Methodology needs refinement'),
(4, 10, 22,'System works well'),
(4, 11, 12,'Good code structure'),
(4, 12, 9, 'Clean interface'),
(5, 13, 20,'Core features operational'),
(5, 14, 13,'Code is modular'),
(5, 15, 8, 'UI is user friendly');

-- User accounts
-- Passwords are stored as plaintext for seed data (auth controller supports this)
INSERT INTO user_account (Username, Password, Status, PersonID) VALUES
('superadmin',       'superadmin123',    'Active', 1),
('muhammad.imran',   'hash_imran_prof',  'Active', 2),
('ayesha.siddiqua',  'hash_ayesha_prof', 'Active', 3),
('usman.mansoor',    'hash_usman_prof',  'Active', 4),
('sara.ahmed',       'hash_sara_prof',   'Active', 5),
('khalid.malik',     'hash_khalid_prof', 'Active', 6),
('nadia.hussain',    'hash_nadia_prof',  'Active', 7),
('tariq.mahmood',    'hash_tariq_prof',  'Active', 8),
('fatima.zahra',     'hash_fatima_prof', 'Active', 9),
('bilal.chaudhry',   'hash_bilal_prof',  'Active', 10),
('amjad.hussain',    'hash_amjad_eval',  'Active', 11),
('ali.raza',         'hash_raza_2026',   'Active', 12),
('zara.malik',       'hash_zara_2026',   'Active', 13),
('omar.farooq',      'hash_omar_2026',   'Active', 14),
('sana.baig',        'hash_sana_2026',   'Active', 15),
('hamza.iqbal',      'hash_hamza_2026',  'Active', 16),
('ayesha.khan',      'hash_ayesha_2026', 'Active', 17),
('imran.tariq',      'hash_imran_2026',  'Active', 18),
('mariam.yousuf',    'hash_mariam_2026', 'Active', 19),
('faisal.nawaz',     'hash_faisal_2026', 'Active', 20),
('hira.shah',        'hash_hira_2026',   'Active', 21),
('hassan.mirza',     'hash_hassan_2026', 'Active', 22),
('noor.javed',       'hash_noor_2026',   'Active', 23),
('usman.ali',        'hash_usman_2026',  'Active', 24),
('sadia.rehman',     'hash_sadia_2026',  'Active', 25),
('bilal.hussain',    'hash_bilalh_2026', 'Active', 26),
('amna.qadir',       'hash_amna_2026',   'Active', 27),
('kashif.mehmood',   'hash_kashif_2026', 'Active', 28),
('rabia.aslam',      'hash_rabia_2026',  'Active', 29),
('saad.latif',       'hash_saad_2026',   'Active', 30),
('zainab.anwar',     'hash_zainab_2026', 'Active', 31);

-- Role assignments
-- Role 4 = SuperAdmin, 3 = Coordinator, 2 = Faculty, 1 = Student
INSERT INTO useraccount_role (AccountID, RoleID) VALUES
(1,  4), -- superadmin
(2,  3), -- coordinator
(3,  2), -- faculty
(4,  2),
(5,  2),
(6,  2),
(7,  2),
(8,  2),
(9,  2),
(10, 2),
(11, 2),
(12, 1), -- students
(13, 1),
(14, 1),
(15, 1),
(16, 1),
(17, 1),
(18, 1),
(19, 1),
(20, 1),
(21, 1),
(22, 1),
(23, 1),
(24, 1),
(25, 1),
(26, 1),
(27, 1),
(28, 1),
(29, 1),
(30, 1),
(31, 1);

-- Sample audit log entries
INSERT INTO audit_log (TableName, RecordID, Action, ChangedBy, NewData) VALUES
('user_account', 1, 'INSERT', 'system', 'Super admin account created'),
('user_account', 2, 'INSERT', 'system', 'Coordinator account created');
