# MediGo

**MediGo** is a full-stack healthcare management web application developed as a university software engineering project. It connects patients, doctors, administrators, pharmacy services, appointments, payments, and AI-assisted doctor discovery in one platform.

## Live Application

- **Frontend:** https://frontend-weld-chi-44.vercel.app
- **Backend API:** https://medigo-a106-api-bre3h2b4bdegfegc.koreacentral-01.azurewebsites.net

## Overview

MediGo supports several types of users:

- **Patients** — registration, login, profile management, doctor discovery, appointments, pharmacy, and payment-related workflows.
- **Doctors** — registration, admin approval, login, professional settings, and appointment-related functionality.
- **Administrators** — patient management, doctor approval, medicine/order management, appointments, reports, and administration.
- **Public visitors** — browsing departments, doctors, and doctor details.

## Main Features

### Patient
- Registration and login
- Profile/account management
- Profile image upload
- Password update and recovery
- Doctor search and doctor details
- Appointment functionality
- Pharmacy and medicine ordering
- Payment workflow

### Doctor
- Doctor registration
- Admin approval workflow
- Doctor login
- Professional profile/settings management
- Consultation information
- Appointment dashboard

### Admin
- Admin authentication
- Doctor request approval/rejection
- Patient and doctor management
- Appointment management
- Medicine and medicine-order management
- Reports/dashboard functionality

### Pharmacy
- Medicine listing
- Shopping cart
- Order creation
- Payment records
- SSLCommerz sandbox payment integration

### AI Doctor Assistant
MediGo includes an AI-powered doctor finder that helps users identify an appropriate medical specialty and then connects the recommendation with doctors available in the system.

The assistant is intended for **healthcare navigation and doctor discovery**, not diagnosis or prescription.

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- React Router
- Axios
- Bootstrap
- React Toastify
- React Icons

### Backend
- ASP.NET Core Web API
- C#
- Entity Framework Core
- REST APIs
- ASP.NET Core Identity password hashing utilities

### Database
- Microsoft SQL Server
- Azure SQL Database

### External Services
- Google Gemini API
- Gmail SMTP
- SSLCommerz Sandbox Payment Gateway

### Deployment
- **Frontend:** Vercel
- **Backend:** Microsoft Azure App Service
- **Database:** Azure SQL Database

## System Architecture

```text
User
 |
 v
React / Vite Frontend
(Vercel)
 |
 | HTTPS / REST API
 v
ASP.NET Core Web API
(Azure App Service)
 |
 +--------------------+
 |                    |
 v                    v
Azure SQL        External Services
Database         Gemini / Gmail / SSLCommerz
```

## Project Structure

```text
MEDIGO-ISD-CSE3224/
|
|-- frontend/
|   |-- src/
|   |   |-- assets/
|   |   |-- config/
|   |   |-- Style/
|   |   |-- view/
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- package.json
|   |-- vite.config.js
|   `-- vercel.json
|
`-- backend/
    |-- Controllers/
    |-- Data/
    |-- Models/
    |-- Services/
    |-- Program.cs
    `-- appsettings.json
```

## Local Development

### Prerequisites
- Node.js and npm
- .NET SDK 10
- SQL Server / SQL Server Express
- Git

### Frontend

From the `frontend` directory:

```bash
npm install
npm run dev
```

Local frontend:

```text
http://localhost:5173
```

Create/update `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5138
```

### Backend

From the `backend` directory:

```bash
dotnet restore
dotnet run
```

Or with hot reload:

```bash
dotnet watch run
```

Local backend:

```text
http://localhost:5138
```

## Database Configuration

### Backend / Azure App Service

Typical settings:

```text
FrontendUrl

Gemini__ApiKey
Gemini__Model
Gemini__BaseUrl

EmailSettings__Password

DefaultAdmin__Username
DefaultAdmin__Password

SslCommerz__StoreId
SslCommerz__StorePassword
SslCommerz__SessionUrl
SslCommerz__ValidationUrl
SslCommerz__BackendBaseUrl
SslCommerz__FrontendBaseUrl
SslCommerz__IpnUrl
```

Production SQL connection string:

```text
DefaultConnection
```

## Production URLs

### Frontend
```text
https://frontend-weld-chi-44.vercel.app
```

### Backend
```text
https://medigo-a106-api-bre3h2b4bdegfegc.koreacentral-01.azurewebsites.net
```

## CORS

Production frontend origin:

```text
FrontendUrl=https://frontend-weld-chi-44.vercel.app
```

Avoid a trailing slash when exact-origin CORS matching is used.

## Security

MediGo uses security controls such as:

- Password hashing instead of plain-text password storage
- Server-side validation
- Role-specific application behavior
- Doctor approval before normal doctor access
- Production secrets stored outside source code
- CORS configuration
- AI API rate limiting
- File upload handling
- Generic login failure messages

## Payment Gateway

MediGo uses the **SSLCommerz sandbox environment** for payment testing.

The Store ID and Store Password must remain on the backend and must never be exposed in frontend code.

Typical flow:

```text
Patient
  |
  v
MediGo Checkout
  |
  v
Backend creates transaction
  |
  v
SSLCommerz
  |
  +--> Success
  +--> Failure
  +--> Cancel
  |
  v
Backend verifies and records payment
```

## AI Doctor Assistant

The AI Doctor Assistant uses Google Gemini through the backend.

```text
User request
   |
   v
MediGo Backend
   |
   v
Gemini API
   |
   v
Specialty / urgency suggestion
   |
   v
Search MediGo doctors
```

## Deployment

### Frontend

```bash
npm run build
```

The frontend is deployed on Vercel.

### Backend

Typical Linux publish command:

```powershell
dotnet publish -c Release -r linux-x64 --self-contained false -o .\publish-linux
```

The backend is deployed on Azure App Service.

### Database

Production data is stored in Azure SQL Database.

## Important Notes

- Never commit private credentials.
- Use SSLCommerz sandbox credentials for testing.
- Public backend availability does not mean private data should be publicly accessible.
- Protected endpoints should enforce proper authentication and authorization.
- Test database persistence and uploaded files after deployment.

## Academic Project

**Project Group:** A103  
**Repository:** `MEDIGO-SD-CSE3200`

## Team

- Hasib Shahriar
- Rashedul Hasan

## Future Improvements

- Video consultation / telemedicine
- Real-time doctor availability
- Better appointment scheduling and reminders
- Electronic prescriptions
- Medical record management
- Advanced reports and analytics
- Notifications
- Mobile applications
- Production payment gateway configuration
- Stronger authentication/authorization
- Automated testing and CI/CD

## Disclaimer

MediGo is an academic healthcare management project. Its AI functionality is intended for healthcare navigation and doctor discovery and is not a replacement for professional medical diagnosis or emergency medical care.

---

**MediGo — Healthcare Anytime, Anywhere**
