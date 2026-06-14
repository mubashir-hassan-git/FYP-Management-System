# FYP Management System

## Overview

The Final Year Project (FYP) Management System is a web-based application developed to automate and manage the complete Final Year Project lifecycle at Namal University.

The current FYP process relies heavily on manual coordination and spreadsheet-based record keeping, making project management increasingly difficult as the number of students and projects grows each year. This system provides a centralized platform that streamlines project management activities, improves transparency, and ensures efficient collaboration among students, faculty members, coordinators, evaluators, and administrators.

The system automates the complete workflow from project proposal submission to final evaluation while maintaining accurate records and role-based access control.

---

## Problem Statement

Managing Final Year Projects manually at Namal University has become increasingly challenging due to the growing number of students and projects each academic year.

The current process suffers from:

* Manual group formation and project allocation
* Spreadsheet-based record management
* Data redundancy and inconsistency
* Delayed supervisor assignments and approvals
* Lack of centralized project tracking
* Difficulty maintaining historical records
* Increased administrative workload
* Limited scalability

A centralized FYP Management System is required to automate these activities, improve efficiency, and ensure accurate management of project information.

---

## Objectives

| No. | Objective                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Automate the complete FYP management lifecycle from group formation to final evaluation.                                       |
| 2   | Provide secure role-based access for students, faculty members, coordinators, evaluators, and administrators.                  |
| 3   | Maintain a centralized platform for project records, progress tracking, reporting, and efficient management of FYP activities. |
| 4   | Ensure data integrity, consistency, security, and scalability to support future growth and increasing numbers of users.        |

---

## Key Features

| Module                | Description                                             |
| --------------------- | ------------------------------------------------------- |
| Proposal Management   | Submit, review, and approve project proposals           |
| Group Management      | Create and manage student groups                        |
| Project Management    | Assign and monitor projects                             |
| Supervisor Management | Assign supervisors and co-supervisors                   |
| Milestone Management  | Create milestones and manage deadlines                  |
| Submission Management | Upload project submissions and maintain version history |
| Feedback Management   | Provide feedback and revision recommendations           |
| Evaluation Management | Schedule evaluations and record marks                   |
| User Management       | Manage users, accounts, and permissions                 |
| Reporting System      | Generate project and performance reports                |

---

## User Roles

| Role          | Responsibilities                                                                   |
| ------------- | ---------------------------------------------------------------------------------- |
| Student       | Create groups, submit proposals, upload submissions, view feedback and results     |
| Faculty       | Supervise projects, review submissions, and provide feedback                       |
| Coordinator   | Manage FYP activities, assign supervisors, create milestones, and monitor progress |
| Evaluator     | Evaluate projects and record marks                                                 |
| Administrator | Manage users, roles, and system operations                                         |

---

## Technology Stack

| Layer                   | Technology            |
| ----------------------- | --------------------- |
| Frontend                | HTML, CSS, JavaScript |
| Backend                 | PHP                   |
| Database                | MySQL                 |
| Version Control         | Git and GitHub        |
| Development Methodology | Agile Scrum           |

---

## Software Development Methodology

The project follows the Agile Scrum methodology.

Development is organized into short and manageable sprints. Continuous stakeholder feedback allows iterative improvements throughout the development lifecycle. This approach enhances flexibility, reduces project risks, and improves overall software quality.

---

## Database Overview

### Core Entities

| Entity              |
| ------------------- |
| Person              |
| Student             |
| Faculty             |
| Coordinator         |
| External Evaluator  |
| Evaluators          |
| Department          |
| Batch               |
| Group               |
| Project             |
| Milestone           |
| Submission          |
| Submission File     |
| Feedback            |
| Evaluation          |
| Evaluation Type     |
| Evaluation Criteria |
| Evaluation Result   |
| User Account        |
| Role                |

### Associative Entities

| Entity                |
| --------------------- |
| UserAccount_Role      |
| Project_Supervision   |
| Evaluation_Assignment |

---

## Database Statistics

| Component         | Count |
| ----------------- | ----- |
| Tables            | 22    |
| Stored Procedures | 11    |
| Functions         | 4     |
| Triggers          | 3     |
| Views             | 1     |

---

## Stored Procedures

| Procedure Name           | Description                           |
| ------------------------ | ------------------------------------- |
| sp_register_student      | Registers a new student               |
| sp_register_faculty      | Registers a new faculty member        |
| sp_create_group          | Creates a student group               |
| sp_assign_supervisors    | Assigns supervisors to projects       |
| sp_record_marks          | Records evaluation marks              |
| sp_get_student_profile   | Retrieves student profile information |
| sp_get_faculty_profile   | Retrieves faculty profile information |
| sp_update_profile        | Updates profile details               |
| sp_change_password       | Changes account password              |
| sp_toggle_account_status | Activates or deactivates accounts     |
| sp_system_stats          | Generates dashboard statistics        |

---

## User Defined Functions

| Function Name       | Description                            |
| ------------------- | -------------------------------------- |
| fn_full_name        | Returns the full name of a person      |
| fn_eval_percentage  | Calculates evaluation percentage       |
| fn_submission_count | Returns total project submissions      |
| fn_group_progress   | Calculates project progress percentage |

---

## Database Triggers

| Trigger Name                 | Description                                             |
| ---------------------------- | ------------------------------------------------------- |
| trg_before_insert_submission | Validates submissions and generates submission versions |
| trg_after_update_user_status | Logs account status changes                             |
| trg_after_delete_person      | Logs deleted records                                    |

---

## Database Views

| View Name                        | Description                                                          |
| -------------------------------- | -------------------------------------------------------------------- |
| view_student_milestone_dashboard | Displays milestone progress and submission status for student groups |

---

## Business Rules

| Rule Category      | Description                                            |
| ------------------ | ------------------------------------------------------ |
| User Management    | Each person can have only one user account             |
| Role Management    | Every account must have at least one assigned role     |
| Group Management   | Each group must contain exactly two students           |
| Project Management | A project is assigned to exactly one group             |
| Supervision        | Every project must have a supervisor and co-supervisor |
| Milestones         | Milestones are defined separately for each batch       |
| Submissions        | Multiple versions of submissions are allowed           |
| Evaluations        | Multiple evaluators can evaluate the same project      |

---

## Project Workflow

| Phase | Activity               |
| ----- | ---------------------- |
| 1     | Student Registration   |
| 2     | Group Formation        |
| 3     | Proposal Submission    |
| 4     | Proposal Approval      |
| 5     | Supervisor Assignment  |
| 6     | Milestone Creation     |
| 7     | Submission Upload      |
| 8     | Feedback and Revisions |
| 9     | Evaluation Scheduling  |
| 10    | Marks Recording        |
| 11    | Final Evaluation       |
| 12    | Project Completion     |

---

## Repository Structure

```text
FYP-Management-System
│
├── Documentation
│   ├── Project Proposal
│   ├── SRS
│   ├── Database Design
│   └── Meeting Minutes
│
├── Database
│   ├── Schema
│   ├── Stored Procedures
│   ├── Functions
│   ├── Triggers
│   └── Views
│
├── Backend
│
├── Frontend
│
├── Assets
│
├── Testing
│
└── README.md
```

---

## Minutes of Meetings

Project meeting records and discussions are maintained at:

https://docs.google.com/spreadsheets/d/1H5D9X60Gsvk6lgzza5j0unCG4zigcmmti7lNF-49EWk/edit?gid=0

---

## Repository

GitHub Repository:

https://github.com/mubashir-hassan-git/FYP-Management-System

---

## Team Members

| Name              | Registration Number |
| ----------------- | ------------------- |
| Mubashir Hassan   | NUM-BSCS-2024-38    |
| Sadia             | NUM-BSCS-2024-68    |
| Shumaila Sarfaraz | NUM-BSCS-2024-72    |

---

## License

This project was developed for academic and educational purposes as part of the Database Systems course in the Department of Computer Science, Namal University.
