# ResolveIT-Smart-Grievance-and-Feedback-Management-System


A full-stack web application for managing complaints and grievances with role-based access, status tracking, escalation logic, file attachments, and analytics.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Database Schema](#database-schema)

---

## 📌 Overview

ResolveIT is a smart grievance portal that allows users to submit complaints (anonymously or publicly), track their status in real time, and receive replies from admins. Admins and staff can manage, assign, escalate, and resolve complaints through a dedicated dashboard.

---

## ✨ Features

### User
- Register and login with JWT authentication
- Submit complaints with category, urgency, description, and file attachments
- Choose anonymous or public submission mode
- Track complaint status in real time (New → Under Review → Resolved)
- View activity timeline and admin replies
- Receive in-app notifications on status updates
- Update profile name and password

### Staff
- View complaints assigned to them
- Update complaint status with comments
- Add internal notes (visible only to staff/admin)
- Send public replies to users

### Admin
- View and manage all complaints
- Assign complaints to staff members
- Update status, add notes, send replies
- Manually escalate complaints
- View escalation history

### Super Admin
- All admin capabilities
- Receive auto-escalated complaints (unresolved after 3 days)
- Full access to reports and analytics

### Reports & Analytics
- Visual charts — complaints by category, status, urgency
- Export data to CSV

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), React Router, Axios |
| Backend | Spring Boot 3, Spring Security, Spring Data JPA |
| Authentication | JWT (jjwt) |
| Database | MySQL 8 |
| Build Tool | Maven |
| IDE | VS Code |
| Language | Java 17, JavaScript |

---

## 📁 Project Structure

```
resolveit/
├── backend/                          # Spring Boot backend
│   └── src/main/java/com/resolveit/backend/
│       ├── controller/               # REST controllers
│       │   ├── AuthController.java
│       │   ├── ComplaintController.java
│       │   ├── EscalationController.java
│       │   └── NotificationController.java
│       ├── entity/                   # JPA entities
│       │   ├── User.java
│       │   ├── Complaint.java
│       │   ├── StatusLog.java
│       │   ├── MediaUpload.java
│       │   ├── Note.java
│       │   ├── Escalation.java
│       │   └── Notification.java
│       ├── repository/               # Spring Data repositories
│       ├── service/                  # Business logic
│       ├── security/                 # JWT filter & config
│       │   └── jwt/
│       │       ├── JwtUtil.java
│       │       └── JwtFilter.java
│       └── dto/                      # Request/Response DTOs
│
├── frontend/                         # React frontend
│   └── src/
│       ├── pages/                    # Page components
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── UserDashboard.jsx
│       │   ├── AdminDashboard.jsx
│       │   ├── StaffDashboard.jsx
│       │   ├── SuperAdminDashboard.jsx
│       │   ├── AdminComplaints.jsx
│       │   ├── SubmitComplaint.jsx
│       │   ├── MyComplaints.jsx
│       │   ├── Escalations.jsx
│       │   ├── Notifications.jsx
│       │   ├── Profile.jsx
│       │   ├── Settings.jsx
│       │   └── Reports.jsx
│       ├── components/               # Reusable components
│       │   ├── PrivateRoute.jsx
│       │   └── FileViewer.jsx
│       ├── context/
│       │   └── AuthContext.jsx       # Auth state management
│       └── api/
│           └── axios.js              # Axios instance with JWT interceptor
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Java 17+
- Maven 3.8+
- MySQL 8+
- Node.js 18+
- VS Code

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/resolveit.git
cd resolveit
```

---

### 2. Set Up the Database

Open MySQL and run:

```sql
CREATE DATABASE resolveit_db;
```

---

### 3. Configure the Backend

Open `backend/src/main/resources/application.properties` and update:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/resolveit_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.open-in-view=false

jwt.secret=resolveITSuperSecretKey1234567890ABCDEFabcdef
jwt.expiration=86400000

file.upload-dir=uploads
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

---

### 4. Run the Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on: **http://localhost:8080** ✅

---

### 5. Run the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:5173** ✅

---

### 6. Open in Browser

Go to: **http://localhost:5173**

---

## 🔐 Default Test Accounts

Register users with these roles to test:

| Role | Email | Password |
|---|---|---|
| User | user@test.com | pass123 |
| Staff | staff@test.com | pass123 |
| Admin | admin@test.com | pass123 |
| Super Admin | super@test.com | pass123 |

> You can register from the `/register` page and select the role.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/profile` | Get current user profile |
| PATCH | `/api/auth/profile/name` | Update display name |
| PATCH | `/api/auth/profile/password` | Update password |

### Complaints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/complaints` | Submit complaint (with files) | All users |
| GET | `/api/complaints/my` | Get my complaints | All users |
| GET | `/api/complaints` | Get all complaints | Admin, Staff, Super Admin |
| GET | `/api/complaints/assigned` | Get assigned complaints | Staff |
| GET | `/api/complaints/{id}/timeline` | Get status timeline | All |
| PATCH | `/api/complaints/{id}/status` | Update status | Admin, Staff |
| PATCH | `/api/complaints/{id}/assign` | Assign to staff | Admin |
| POST | `/api/complaints/{id}/notes` | Add note/reply | Admin, Staff |
| GET | `/api/complaints/{id}/notes` | Get all notes | Admin, Staff |
| GET | `/api/complaints/{id}/notes/public` | Get public replies | All |
| GET | `/api/complaints/staff` | Get all staff emails | Admin |
| GET | `/api/complaints/file/{fileName}` | Download file | All |

### Escalations
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/escalations` | Escalate a complaint | Admin, Staff |
| GET | `/api/escalations` | Get all escalations | Admin, Super Admin |
| PATCH | `/api/escalations/{id}/resolve` | Resolve escalation | Admin, Super Admin |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get my notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| POST | `/api/notifications/mark-read` | Mark all as read |

---

## 👥 User Roles

| Role | Permissions |
|---|---|
| **USER** | Submit complaints, track status, view replies, receive notifications |
| **STAFF** | View assigned complaints, update status, add notes, send replies |
| **ADMIN** | All of staff + assign to staff, escalate, view all complaints |
| **SUPER_ADMIN** | All of admin + receive escalations, full reports access |

---

## 🗃️ Database Schema

| Table | Description |
|---|---|
| `users` | Registered users with roles |
| `complaints` | Submitted complaints |
| `status_logs` | Status change history per complaint |
| `media_uploads` | Attached files per complaint |
| `notes` | Internal and public notes per complaint |
| `escalations` | Escalation records |
| `notifications` | User notifications |

---

## 📅 Development Milestones

| Milestone | Weeks | Feature |
|---|---|---|
| 1 | 1–2 | Login, registration, complaint submission |
| 2 | 3–4 | Status tracking and timeline |
| 3 | 5 | Admin dashboard, assign staff, notes |
| 4 | 6–7 | Escalation logic (manual + auto) |
| 5 | 8 | Reports and analytics |

---

## 🤝 Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is for educational purposes as part of a Java full-stack development course.

---

> Built with ❤️ using Spring Boot + React
