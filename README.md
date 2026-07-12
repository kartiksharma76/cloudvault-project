<div align="center">

# ☁️ CloudVault
### **Secure Personal Cloud Storage & Smart Notes Platform**

*A modern full-stack cloud storage application for securely managing files, documents, images, videos, and notes with enterprise-grade authentication.*

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38BDF8?style=for-the-badge&logo=tailwindcss)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge)
![JWT](https://img.shields.io/badge/JWT-Authentication-black?style=for-the-badge&logo=jsonwebtokens)

---

### ☁️ Store • Organize • Secure • Access Anywhere

</div>

---

# 📖 Overview

**CloudVault** is a modern **Full-Stack Personal Cloud Storage & Note Management Platform** that enables users to securely upload, organize, search, and manage files alongside rich note-taking capabilities.

Designed as a **pnpm monorepo**, the application combines a **React + Vite** frontend with an **Express.js backend**, **MySQL**, and **Drizzle ORM**, delivering a scalable and maintainable architecture for cloud storage solutions.

The platform features secure authentication, responsive dashboards, advanced search, analytics, and an elegant user experience built with **Tailwind CSS**, **Radix UI**, and **Framer Motion**.

---

# ✨ Core Features

---

# ☁️ Personal Cloud Storage

Store all your digital assets securely.

Supported file types include

- 📄 Documents
- 🖼 Images
- 🎥 Videos
- 🎵 Audio Files
- 📑 PDFs
- 📦 ZIP Archives
- 📁 Custom Files

Features

- Upload Files
- Download Files
- Delete Files
- Search Files
- Folder Organization
- Storage Analytics

---

# 📝 Smart Notes

Create and organize personal notes.

Features

- Markdown Support
- Rich Text Editing
- Categories
- Search Notes
- Edit Notes
- Delete Notes
- Auto Save

---

# 📊 Dashboard

Monitor your storage usage in real time.

Dashboard includes

- Total Files
- Storage Usage
- Recent Uploads
- Recent Notes
- File Categories
- Activity Timeline
- Usage Analytics

---

# 🔐 Authentication & Security

Secure authentication powered by **JWT** or **Clerk**.

### Features

- User Registration
- Secure Login
- JWT Authentication
- Clerk Authentication
- Protected Routes
- Role-Based Authorization
- Secure Sessions

---

# 📁 File Management

Powerful file organization tools.

Features

- Drag & Drop Upload
- File Preview
- Search Files
- Rename Files
- Delete Files
- Organize by Folder
- Recent Files

---

# 🎨 Modern User Interface

Premium responsive UI built with

- Glassmorphism
- Dark Mode
- Light Mode
- Responsive Layout
- Smooth Animations
- Interactive Components

---

# 📈 Analytics

Track your storage activity.

Includes

- Storage Consumption
- Upload Statistics
- Recent Activity
- File Type Distribution
- User Insights

---

# 🛠 Technology Stack

| Category | Technology |
|-----------|------------|
| Frontend | React + Vite |
| Styling | Tailwind CSS v4 |
| Components | Radix UI |
| Animations | Framer Motion |
| Icons | Lucide React |
| Routing | Wouter |
| Forms | React Hook Form + Zod |
| State Management | TanStack Query |
| Backend | Express.js |
| Runtime | Node.js |
| Authentication | JWT / Clerk |
| Database | MySQL |
| ORM | Drizzle ORM |
| API Specification | OpenAPI 3.1 |
| API Generator | Orval |
| Package Manager | pnpm |

---

# 📂 Project Structure

```text
cloudvault-project/
│
├── artifacts/
│   ├── api-server/
│   └── cloudvault/
│
├── lib/
│   ├── api-client-react/
│   ├── api-spec/
│   ├── api-zod/
│   └── db/
│
├── package.json
├── pnpm-workspace.yaml
├── DEPLOYMENT.md
└── README.md
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/yourusername/cloudvault.git
```

---

# 📦 Install Dependencies

```bash
pnpm install
```

---

# ⚙ Environment Configuration

Create a `.env` file.

```env
DATABASE_URL=mysql://root:password@localhost:3306/cloudvault

CLERK_PUBLISHABLE_KEY=your_publishable_key

CLERK_SECRET_KEY=your_secret_key

PORT=5000
```

---

# 🗄 Database Setup

Build and synchronize the database.

```bash
pnpm --filter @workspace/db run build
```

---

# ▶ Run Development Server

Start both frontend and backend.

```bash
pnpm run dev
```

---

## Run Frontend Only

```bash
pnpm run dev:frontend
```

---

## Run Backend Only

```bash
pnpm run dev:backend
```

---

# 🏗 Production Build

Build the complete workspace.

```bash
pnpm run build
```

---

## Individual Builds

Frontend

```bash
pnpm run build:frontend
```

Backend

```bash
pnpm run build:backend
```

Libraries

```bash
pnpm run build:libs
```

---

# 🔌 API Generation

CloudVault follows a **Contract-First API Design** using **OpenAPI 3.1**.

Whenever the API specification changes, regenerate the client.

```bash
cd lib/api-spec

pnpm run generate
```

Automatically updates

- React Query Hooks
- API Clients
- Type Definitions

---

# 📦 Monorepo Architecture

```text
React Frontend
        │
        ▼
Generated API Client
        │
        ▼
Express REST API
        │
        ▼
Drizzle ORM
        │
        ▼
MySQL Database
```

---

# 🔒 Security Features

- JWT Authentication
- Clerk Authentication
- Protected APIs
- Secure Sessions
- Input Validation
- File Access Control
- Authentication Middleware
- Secure API Routes

---

# 📊 Dashboard Modules

- ☁ Cloud Storage
- 📝 Notes
- 📁 File Explorer
- 📈 Analytics
- 🔍 Search
- 👤 User Profile
- ⚙ Settings
- 🌙 Dark Mode

---

# 🚀 Future Enhancements

Upcoming features

- ☁ Google Drive Integration
- 📦 Dropbox Integration
- 📱 Mobile Applications
- 🤖 AI Note Summarization
- 🧠 Smart File Categorization
- 🔍 OCR Text Recognition
- 📷 Image Search
- 🎤 Voice Notes
- 📄 PDF Annotation
- 🔗 File Sharing
- 👥 Team Workspaces
- 📜 Version History
- 🔔 Notifications
- ☁ AWS S3 Storage
- 🌍 Multi-Language Support

---

# 🎯 Learning Outcomes

This project demonstrates

- React Development
- Express.js Backend
- REST API Development
- JWT Authentication
- Clerk Authentication
- MySQL Integration
- Drizzle ORM
- Monorepo Architecture
- OpenAPI Specification
- API Code Generation
- Responsive UI Development
- Modern Frontend Architecture

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

---

# 📜 License

Licensed under the **MIT License**.

---

<div align="center">

## ⭐ Support This Project

If you found this project useful, consider giving it a **⭐ Star** on GitHub.

Your support helps improve the project and motivates future development.

---

# ☁️ CloudVault

### **Store Securely. Organize Effortlessly. Access Anywhere.**

Built with ❤️ using **React • Express • Node.js • MySQL • Drizzle ORM • Tailwind CSS**

</div>
