# 

# 

# 

# 

# 

# **PLSP Project SRS**

## **Perceptual Learning Style Preference Questionnaire**

## 

14 May 2026

# 

# **1\. Introduction**

## **1.1 Purpose**

The purpose of this document is to define the software requirements for the PLSP (Perceptual Learning Style Preference Questionnaire) system. The system is designed to analyze learner aptitude and perceptual learning style preferences through questionnaire-based assessments while ensuring anonymous participation and data privacy.

## **1.2 Scope**

The PLSP system is a web-based application that allows users to access questionnaires anonymously through QR codes or URLs. The system calculates learning style preference scores, stores anonymized data, and provides dashboards and exportable reports for analysis and decision-making.

The system includes:

* questionnaire management  
* anonymous guest submissions  
* analytical result calculation  
* dashboard reporting  
* export functionality  
* IAM-based permission control  
* audit logging

## **1.3 Objectives**

The objectives of the system are:

* To provide anonymous learner aptitude analysis  
* To support educational analytics and research  
* To ensure privacy-preserving data collection  
* To provide administrative and executive reporting tools  
* To support scalable questionnaire management

## **1.4 Intended User**

| User Type | Description |
| ----- | ----- |
| Guest User | Anonymous Questionnaire Participants |
| Admin | Full System Administrator |
| Executive | Dashboard and Analytic Viewer |

---

# **2\. Overall Description**

## **2.1 Product Perspective**

The PLSP system operates as an independent web platform accessible from desktop and mobile devices. The system supports anonymous access without requiring user registration.

## **2.2 Product Functions**

Main system functions include:

* questionnaire creation and management  
* guest questionnaire submission  
* result analysis and storage  
* dashboard visualization  
* export generation  
* permission management  
* audit logging

## **2.3 User Characteristics**

### **Guest User**

* No registration required  
* Limited access  
* Can submit questionnaire responses

### **Admin**

* Full system access  
* Manages questionnaires and users  
* Access to analytical dashboards and reports  
* Access to anonymized analytical data

### **Executive**

* Access to analytical dashboards and reports  
* Access to anonymized analytical data

## **2.4 Constraints**

* The system must maintain full data anonymization.  
* The system must support responsive web design.  
* The system must support secure data transmission using HTTPS.

---

# **3\. System Features and Functional Requirements**

## **3.1 Questionnaire Management**

### **Description**

The system shall allow administrators to manage questionnaires.

### **Functional Requirements**

| ID | Requirements |
| :---- | :---- |
|  FR-001 | The system shall allow admins to create questionnaires. |
| FR-002 | The system shall allow admins to edit questionnaires. |
| FR-003 | The system shall allow admins to open questionnaires for submissions. |
| FR-004 | The system shall allow admins to close questionnaires. |
| FR-005 | The system shall allow admins to manage questionnaire status. |

## **3.2 Guest Submission Flow**

### **Description**

The system shall support anonymous questionnaire submissions.

### **Functional Requirements**

| ID | Requirements |
| :---- | :---- |
| FR-006 | The system shall allow questionnaire access through QR codes. |
| FR-007 | The system shall allow questionnaire access through URLs. |
| FR-008 | The system shall allow anonymous questionnaire submissions. |
| FR-009 | The system shall generate anonymous session identifiers. |
| FR-010 | The system shall optionally prevent duplicate submissions. |

## **3.3 Result Calculation & Storage**

### **Description**

The system shall calculate learner aptitude scores and store anonymized results.

### **Functional Requirements**

| ID | Requirements |
| :---- | :---- |
| FR-011 | The system shall calculate learning preference scores. |
| FR-012 | The system shall store questionnaire responses securely. |
| FR-013 | The system shall store anonymized analytical results. |
| FR-014 | The system shall generate learner aptitude summaries. |

## **3.4 Dashboard**

### **Description**

The system shall provide analytical dashboards based on user roles.

### **Functional Requirements**

| ID | Requirements |
| :---- | :---- |
| FR-015 | The system shall provide a user dashboard. |
| FR-016 | The system shall provide an executive dashboard. |
| FR-017 | The system shall provide an admin dashboard. |
| FR-018 | The dashboard shall display analytical charts and statistics. |

## **3.5 Export Functionality**

### **Description**

The system shall support exporting analytical data and reports.

### **Functional Requirements**

| ID | Requirements |
| :---- | :---- |
| FR-019 | The system shall export reports as PNG files. |
| FR-020 | The system shall export reports as PDF files. |
| FR-021 | The system shall export reports as CSV files. |
| FR-022 | The system shall export reports as Excel files. |

## 

## **3.6 IAM Permission Registration**

### **Description**

The system shall manage authentication and authorization using role-based permissions.

### **Functional Requirements**

| ID | Requirements |
| :---- | :---- |
| FR-023 | The system shall support admin registration. |
| FR-024 | The system shall support role assignment. |
| FR-025 | The system shall restrict access based on permissions. |
| FR-026 | The system shall manage dashboard access permissions. |

## **3.7 Audit Logging**

### **Description**

The system shall log critical system activities.

### **Functional Requirements**

| ID | Requirements |
| :---- | :---- |
| FR-027 | The system shall log questionnaire creation activities. |
| FR-028 | The system shall log questionnaire modification activities. |
| FR-029 | The system shall log export activities. |
| FR-030 | The system shall log permission management activities. |
| FR-031 | The system shall log administrator login activities. |

---

# **4\. External Interface Requirements**

## **4.1 User Interface**

The system shall provide:

* responsive web interfaces  
* mobile-friendly layouts  
* dashboard visualization  
* QR code access pages

## **4.2 Software Interface**

The system may integrate with:

* database management systems  
* analytics libraries  
* PDF/Excel export libraries

## **4.3 Hardware Interface**

The system shall support:

* desktop devices  
* mobile devices  
* tablets

---

# **5\. Non-Functional Requirements**

## **5.1 Performance Requirements**

* The system should support concurrent questionnaire submissions.  
* Dashboard loading time should remain within acceptable limits.

## **5.2 Security Requirements**

* All sensitive operations shall require authentication.  
* The system shall use HTTPS for secure communication.  
* Data access shall be role-based.

## **5.3 Privacy Requirements**

* The system shall not require personally identifiable information from guest users.  
* All analytical data shall remain anonymized.

## **5.4 Usability Requirements**

* The system shall support intuitive navigation.  
* The system shall support QR-based access.

## **5.5 Reliability Requirements**

* The system shall maintain data integrity during submissions.  
* Audit logs shall be retained for accountability.

---

# **6\. System Architecture Overview**

## **6.1 Architecture Description**

The PLSP system uses a **web-based client-server architecture**.

Users access the system through a web browser. The frontend communicates with the backend API. The backend handles questionnaire logic, result calculation, authentication, permissions, audit logging, and database operations.

## **6.2 Architecture Diagram**

[![][image1]](https://drive.google.com/file/d/1-p3mUko3W3GtDpBG5eMJWw0_vpMXaZna/view?usp=sharing)

## **6.3 Main Components**

| Components | Descriptions |
| ----- | ----- |
| Clients | Desktop, tablet, and mobile users accessing the system. |
| Frontend Application (Web Browser) | Interface used to interact with the PLSP system. (Vue.js) |
| Backend API Server | Handles API requests, business logic, authentication, scoring, and exports. ([Node.js](http://Node.js) \- 22 , NestJS) |
| Cache | Stores temporary, frequently accessed data for performance optimization. (Redis) |
| Database | Stores questionnaires, responses, results, users, permissions, and audit logs. (MongoDB) |

# **7\. Database Requirements**

| Entity | Descriptions |
| ----- | ----- |
| Employee | Stores admin and executive account information for demo authentication and system access. |
| Questionnaire | Stores questionnaire title, description, status, opening date, closing date, and creator information. |
| Question | Stores questionnaire questions, related category, display order, required status, and scoring weight. |
| Category | Stores learning style categories such as Visual, Auditory, Kinesthetic, Reading/Writing, Group, and Individual. |
| Status | Stores questionnaire status values such as Draft, Open, Closed, and Archived. |
| Submission | Stores anonymous guest questionnaire submission records. |
| Answer | Stores each answer selected by the guest user for each question. |
| Result | Stores calculated category scores, percentages, and result interpretation for each submission. |
| AuditLog | Stores important system activity logs such as login, questionnaire updates, exports, and permission changes. |

# **8\. Security and Privacy Requirements**

* Anonymous participation must be supported.  
* Personally identifiable information shall not be collected from guest users.  
* Administrative access shall require authentication.  
* Exported datasets must remain anonymized.

# **9\. User Roles and Permissions**

| Role | Permissions |
| ----- | ----- |
| Guest User | Submit questionnaires and view results |
| Admin | Full system management |
| Executive | Access dashboards and reports |

---

[image1]: <data:image/png;base64,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>