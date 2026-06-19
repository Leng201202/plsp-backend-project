# **Data Dictionary Diagram**

## **\- PLSP Questionnaire Project**

| Document Title | PLSP Data Dictionary Documentation |
| :---- | :---- |
| **Version** | 1.1 (Reviewed) |
| **Date** | 21 May 2026 |
| **Related Documents** | PLSP SRS v1.1 | Data Dictionary v1.1 | Sequence Diagram v1.1 | | Menu and Permission Matrix | ER-Diagram | Functional Requirement  |

## 

# **1\. Introduction**

This data dictionary provides a complete, attribute-level specification of all database entities in the PLSP system. Each entity section defines field names, data types, constraints, key designations, and field descriptions derived from the ER diagram and SRS documentation.

## **1.1 How to Read This Document**

| Column | Description |
| :---- | :---- |
| Attribute | Field name as it appears in the database schema. |
| Data Type | Storage type (e.g., String, Integer, DateTime, ObjectID/UUID, Decimal). |
| Constraints | Validation rules: NOT NULL, UNIQUE, NULLABLE. |
| Key | PK \= Primary Key. FK \= Foreign Key with a reference target. |
| Description | Business-level explanation of the field's purpose. |

# **2\. Entity Definitions**

## **2.1 Employee**

Stores authenticated system users (Admin and Executive). Guest users are not stored in this entity — they access the system anonymously.

| Attribute | Data Type | Constraints | Key | Description |
| ----- | ----- | ----- | ----- | ----- |
| id | INT | NOT NULL, AUTO\_INCREMENT | PK | Unique identifier for each employee record. |
| employee\_uuid | VARCHAR(36) | NOT NULL, UNIQUE |  | UUID used for cross-system integration. |
| employee\_id | INT | NOT NULL |  | Stores IAM/User ID reference used by this module. |
| employee\_code | VARCHAR(10) | NULL |  | Employee code for university personnel. |
| email | VARCHAR(100) | NOT NULL, UNIQUE |  | Employee email address. |
| title\_th | VARCHAR(100) | NULL |  | Thai title or prefix. |
| firstname | VARCHAR(100) | NOT NULL |  | Employee first name in Thai. |
| middlename | VARCHAR(100) | NULL |  | Employee middle name in Thai. |
| lastname | VARCHAR(100) | NOT NULL |  | Employee last name in Thai. |
| title\_en | VARCHAR(100) | NULL |  | English title or prefix. |
| firstname\_en | VARCHAR(100) | NULL |  | Employee first name in English. |
| middlename\_en | VARCHAR(100) | NULL |  | Employee middle name in English. |
| lastname\_en | VARCHAR(100) | NULL |  | Employee last name in English. |
| institute\_id | INT | NULL | FK | References institute information. |
| department\_id | INT | NULL | FK | References department information. |
| position\_type | INT | NULL | FK | References employee position type. |
| position\_special | INT | NULL | FK | References special position information. |
| last\_login\_at | DATETIME | NULL |  | Stores the latest login timestamp. |
| last\_seen\_at | DATETIME | NULL |  | Stores the latest activity timestamp. |
| education\_level | TINYINT | NULL |  | Highest education level of the employee. |
| mobile | VARCHAR(10) | NULL |  | Employee mobile phone number. |
| workphone | VARCHAR(10) | NULL |  | Employee work phone number. |
| synced\_at | DATETIME | NULL |  | Last synchronization timestamp from IAM. |
| created\_at | DATETIME | NOT NULL |  | Record creation timestamp. |
| updated\_at | DATETIME | NULL |  | Latest record update timestamp from IAM. |
| deleted\_at | DATETIME | NULL |  | Soft delete timestamp. |
| is\_active | ENUM(0,1) | NOT NULL DEFAULT 1 |  | Indicates whether the employee record is active or inactive. |

## **2.2 Questionnaire**

Stores each questionnaire created by an admin, including its title, lifecycle status, and audit metadata.

| Attribute | Data Type | Constraints | Key | Description |
| ----- | ----- | ----- | ----- | ----- |
| id | VARCHAR(36)(uuid) | NOT NULL, UNIQUE | PK | Unique identifier for each questionnaire. |
| title | VARCHAR(255) | NOT NULL |  | Title of the questionnaire displayed to users. |
| description | TEXT | NULLABLE |  | Description or explanation of the questionnaire. |
| status\_id | VARCHAR(36) | NOT NULL | FK → Status | Current lifecycle status: Draft, Open, Closed, or Archived. |
| open\_date | DATETIME | NULLABLE |  | Date and time when the questionnaire becomes available. |
| close\_date | DATETIME | NULLABLE |  | Date and time when the questionnaire closes for submissions. |
| is\_allow\_multi\_submit | boolean | default-false |  | Allow user to submit one or more time |
| submission | Array |  | FK \-\> Submissions | One questionnaire has many submissions |
| created\_by | INT | NOT NULL | FK → Employee | Employee who created this questionnaire. |
| created\_at | DATETIME | NOT NULL |  | Timestamp of questionnaire creation. |
| updated\_by | INT | NULLABLE | FK → Employee | Employee who last updated the questionnaire. |
| updated\_at | DATETIME | NULLABLE |  | Timestamp of the last update. |
| deleted\_at | DATETIME | NULL |  | Soft delete timestamp. |
| deleted\_by | INT | NULL | FK → Employee | Deleted by employee |

## **2.3 Question**

Stores individual questions within a questionnaire, each linked to a learning style category.

| Attribute | Data Type | Constraints | Key | Description |
| ----- | ----- | ----- | ----- | ----- |
| id | VARCHAR(36)(uuid) | NOT NULL, UNIQUE | PK | Unique identifier for each question. |
| questionnaire\_id | VARCHAR(36) | NOT NULL | FK → Questionnaire | The parent questionnaire this question belongs to. |
| category\_id | VARCHAR(36) | NOT NULL | FK → Category | Learning style category this question measures. |
| question\_text | TEXT | NOT NULL |  | The full text of the question displayed to the user. |
| order\_no | INT | NOT NULL |  | Display order of the question within the questionnaire. |
| is\_required | BOOLEAN | NOT NULL DEFAULT TRUE |  | Indicates whether the question must be answered before submission. |
| weight | INT | NOT NULL DEFAULT 1 |  | Weight value used for weighted score calculation. |
| answer | ARRAY |  | FK \-\> Answers | Answer  and Question Relation |
| created\_by | INT | NOT NULL | FK → Employee | Employee who created this question. |
| created\_at | DATETIME | NOT NULL |  | Timestamp of question creation. |
| updated\_by | INT | NULLABLE | FK → Employee | Employee who last modified this question. |
| updated\_at | DATETIME | NULLABLE |  | Timestamp of the last update. |
| deleted\_at | DATETIME | NULL |  | Soft delete timestamp. |
| deleted\_by | INT | NULL | FK → Employee | Deleted by employee |

## **2.4 Category**

Stores learning style categories. Typical values: Visual, Auditory, Kinesthetic, Reading/Writing, Group, Individual.

| Attribute | Data Type | Constraints | Key | Description |
| ----- | ----- | ----- | ----- | ----- |
| id | VARCHAR(36)(uuid) | NOT NULL, UNIQUE | PK | Unique identifier for each learning style category. |
| name | VARCHAR(100) | NOT NULL, UNIQUE |  | Category name such as Visual, Auditory, Kinesthetic, Reading/Writing, Group, or Individual. |
| description | TEXT | NULLABLE |  | Optional description of the learning style category. |
| created\_by | INT | NOT NULL | FK → Employee | Employee who created this category. |
| created\_at | DATETIME | NOT NULL |  | Timestamp of category creation. |
| updated\_by | INT | NULLABLE | FK → Employee | Employee who last modified this category. |
| updated\_at | DATETIME | NULLABLE |  | Timestamp of the last update. |
| deleted\_at | DATETIME | NULL |  | Soft delete timestamp. |
| deleted\_by | INT | NULL | FK → Employee | Deleted by employee |

## **2.5 Status**

Lookup table for questionnaire lifecycle statuses. Allowed values: Draft, Open, Closed, Archived.

| Attribute | Data Type | Constraints | Key | Description |
| ----- | ----- | ----- | ----- | ----- |
| id | VARCHAR(36)(uuid) | NOT NULL, UNIQUE | PK | Unique identifier for each status value. |
| name | VARCHAR(50) | NOT NULL, UNIQUE |  | Status name such as Draft, Open, Closed, or Archived. |
| description | TEXT | NULLABLE |  | Optional description of the questionnaire status. |
| created\_by | INT | NOT NULL | FK → Employee | Employee who created this status entry. |
| created\_at | DATETIME | NOT NULL |  | Creation timestamp of the status record. |
| updated\_by | INT | NULLABLE | FK → Employee | Employee who last modified this status record. |
| updated\_at | DATETIME | NULLABLE |  | Timestamp of the last update. |
| deleted\_at | DATETIME | NULL |  | Soft delete timestamp. |
| deleted\_by | INT | NULL | FK → Employee | Deleted by employee |

## **2.6 Submissions**

Records each anonymous questionnaire submission. No personal data is stored — only a system-generated anonymous session identifier.

| Attribute | Data Type | Constraints | Key | Description |
| ----- | ----- | ----- | ----- | ----- |
| id | VARCHAR(36)(uuid) | NOT NULL, UNIQUE | PK | Unique identifier for each submission record. |
| questionnaire\_id | VARCHAR(36) | NOT NULL | FK → Questionnaire | The questionnaire that was submitted. |
| anonymous\_session\_id | VARCHAR(64) | NOT NULL |  | System-generated anonymous identifier that is never linked to personally identifiable information (PII). |
| answers | ARRAY | NULLABLE | FK-\> Answer | Answer in Submission |
| submitted\_at | DATETIME | NOT NULL |  | Timestamp when the submission was recorded. |
| deleted\_at | DATETIME | NULL |  | Soft delete timestamp. |
| deleted\_by | INT | NULL | FK → Employee | Deleted by employee |

## **2.7 Answer**

Stores the individual answer selected by a guest user for each question within a submission.

| Attribute | Data Type | Constraints | Key | Description |
| ----- | ----- | ----- | ----- | ----- |
| id | VARCHAR(36)(uuid) | NOT NULL, UNIQUE | PK | Unique identifier for each answer record. |
| submission\_id | VARCHAR(36) | NOT NULL | FK → Submission | Parent submission this answer belongs to. |
| question\_id | VARCHAR(36) | NOT NULL | FK → Question | The question being answered. |
| selected\_value | INT | NOT NULL |  | The value selected by the guest user using the Likert scale (1–5). |

## **2.8 Result**

Stores the calculated learning style preference score for a submission, broken down per category.

| Attribute | Data Type | Constraints | Key | Description |
| ----- | ----- | ----- | ----- | ----- |
| id | VARCHAR(36)(uuid) | NOT NULL, UNIQUE | PK | Unique identifier for each result record. |
| submission\_id | VARCHAR(36) | NOT NULL | FK → Submission | The submission this result belongs to. |
| category\_id | VARCHAR(36) | NOT NULL | FK → Category | The learning style category being scored. |
| rawTotalScore | DECIMAL(10,2) | NOT NULL |  | Sum of all selected values for this category. |
| percentage | DECIMAL(5,2) | NOT NULL |  | Score represented as a percentage of the maximum possible score for this category. |
| classification\_rule\_id | VARCHAR |  | FK-\> classification | trace which rule was used and join for filtering   |
| classification | VARCHAR(20) | NOT NULL |  | Classification label |
| calculated\_at | DATETIME | NOT NULL |  | Timestamp when the result was calculated. |
| deleted\_at | DATETIME | NULL |  | Soft delete timestamp. |
| deleted\_by | INT | NULL | FK → Employee | Deleted by employee |

## **2.9 Classification (Dynamic System Configuration)**

Stores dynamic scoring interpretation rules for each learning style category. These rules define how raw scores are converted into learning style classifications.

| Attribute | Data Type | Constraints | Key | Description |
| ----- | ----- | ----- | ----- | ----- |
| id | VARCHAR(36) (uuid) | NOT NULL, UNIQUE | PK | Unique identifier for each classification rule. |
| category\_id | VARCHAR(36) | NOT NULL | FK → Category | The learning style category this rule applies to. |
| label | VARCHAR(50) | NOT NULL |  | Classification label such as Major, Minor, or Negligible. |
| min\_score | INT | NOT NULL |  | Minimum score required for this classification. |
| max\_score | INT | NOT NULL |  | Maximum score allowed for this classification. |
| is\_active | BOOLEAN | NOT NULL DEFAULT TRUE |  | Indicates whether this rule is currently enabled for scoring. |
| created\_by | INT | NOT NULL | FK → Employee | Employee who created the rule. |
| created\_at | DATETIME | NOT NULL |  | Timestamp of rule creation. |
| updated\_by | INT | NULL | FK → Employee | Employee who last modified the rule. |
| updated\_at | DATETIME | NULL |  | Timestamp of last update. |
| deleted\_at | DATETIME | NULL |  | Soft delete timestamp (null \= not deleted). |
| deleted\_by | INT | NULL | FK → Employee | Employee who deleted the rule. |

## **3.0 AuditLog**

Records significant system events for accountability, compliance, and monitoring. Covers logins, questionnaire changes, exports, and permission updates.

| Attribute | Data Type | Constraints | Key | Description |
| ----- | ----- | ----- | ----- | ----- |
| id | VARCHAR(36) (uuid) | NOT NULL, UNIQUE | PK | Unique identifier for each audit log entry. |
| employee\_id | INT | NOT NULL | FK → Employee | The authenticated employee who performed the action. |
| action | ENUM | NOT NULL |  | Type of action such as LOGIN, CREATE, UPDATE, OPEN, CLOSE, EXPORT, DELETE, or PERMISSION\_CHANGE. |
| module | ENUM | NOTNULL |  | Employee, Questionnaire, Question, Result |
| record\_id | VARCHAR(36) | NULLABLE |  | Changen record id |
| details | JSON | NULLABLE |  | Additional contextual detail about the action performed. |
| status | ENUM | NOT NULL |  | Audit SUCCESS and FAILED |
| ip\_address | VARCHAR(45) | NULLABLE |  | User IP |
| user\_agent | TEXT | NULLABLE |  | Browser /device info |
| status | VARCHAR(20) | NOT NULL |  | SUCCESS or FAILED |
| timestamp | DATETIME | NOT NULL |  | Date and time when the action occurred. |

