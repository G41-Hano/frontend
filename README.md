# 📚 Hano Frontend
### An Interactive Vocabulary Learning Platform for Hearing-Impaired Grade 3 Students.

---

## 🌟 Project Overview
This repository contains the frontend application for **Hano**, an educational platform built to facilitate vocabulary learning for hearing-impaired Grade 3 students. It provides a dynamic, responsive, and highly interactive user interface.

## 💻 Frontend Stack & Technologies

| Category | Technology | Version | Description |
| :--- | :--- | :--- | :--- |
| **Core** | React.js | v19.0.0 | Core JavaScript library for building the UI. |
| **Build Tool** | Vite | v6.2.4 | Fast build tool and development server. |
| **Styling 1** | Material UI (MUI) | v7.0.1 | Pre-built React components for styling and icons. |
| **Styling 2** | Tailwind CSS | v4.1.1 | Utility-first CSS framework for responsive design. |
| **Styling 3** | Emotion | v11.14.0 | CSS-in-JS styling library for flexible styling. |
| **Navigation** | React Router | v7.4.1 | Handles client-side routing and navigation between pages. |
| **Data Fetching** | Axios | Latest | Promise-based HTTP client for making API requests. |
| **Authentication** | JWT Decode | Latest | Decodes JSON Web Tokens for user authentication. |

---

## 🚀 Local Installation & Run

Follow these steps to get the Hano frontend running on your local machine.

### Prerequisites
Ensure you have **Node.js** and **npm** installed.

### Steps

1.  **Navigate to the Main App Folder:**
    ```bash
    cd Hano
    ```
2.  **Clone the Repository:**
    ```bash
    git clone https://github.com/G41-Hano/frontend.git
    ```
3.  **Navigate to the Frontend Directory:**
    ```bash
    cd frontend
    ```
4.  **Create Environment File:**
    Create a file named `.env` in the `frontend` directory.
5.  **Configure API URL:**
    Paste the following structure into your `.env` file and replace the placeholder with your local backend server URL:
    ```
    VITE_API_URL = "http://localhost:8000"
    >  Example: VITE_API_URL = "http://localhost:8000"
    ```
    > 💡 ***Note:*** *The `VITE_API_URL` should match the URL provided when running the backend server.* <br>
    > 💡 ***Example:*** *VITE_API_URL = "http://localhost:8000"*
6.  **Install Dependencies:**
    ```bash
    npm install
    ```
7.  **Run the Server:**
    ```bash
    npm run dev
    ```
    The application will typically be accessible at `http://localhost:5173`.

---

### 🚀 Deployment: Vercel Git Integration

The Hano frontend is deployed using **Vercel's Git Integration** for Continuous Deployment (CD). Every push to the main branch of the connected repository will automatically trigger a new build and deployment.

### ⚙️ Vercel Setup Steps

1.  **Prerequisites:** Ensure you have a Vercel account and the repository is hosted on **GitHub, GitLab, or Bitbucket**.
2.  **Import Project:** Navigate to the [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** $\rightarrow$ **"Project"**.
3.  **Connect Git Repository:** Select the Git provider and import the **`G41-Hano/frontend`** repository.
4.  **Configure Project:** Vercel will auto-detect the **Vite/React** configuration, but ensure the settings are correct:
    * **Root Directory:** If the project is the root of the Git repo, leave this blank.
    * **Build Command:** `npm run build`
    * **Output Directory:** `dist` (Vite's default output directory)
5.  **Environment Variables:** Add the required environment variable for the API endpoint:
    * Go to **Settings** $\rightarrow$ **Environment Variables**.
    * Add:
        | Name | Value | Environments |
        | :--- | :--- | :--- |
        | **`VITE_API_URL`** | *https://backend-o2s1.onrender.com* | **Production, Preview, Development** |
6.  **Deploy:** Click **"Deploy"**. The application will now build and be live at the provided Vercel URL.

### 🔄 Continuous Deployment

* **Production:** Pushes to the **`main`** branch will automatically trigger a new build and update the production URL.
* **Preview:** Opening a Pull Request (PR) against the `main` branch will trigger a **Preview Deployment** with a unique URL, allowing for testing before merging.

---

## 🔑 Sample Credentials for Testing

Use the following accounts for system testing and validation:

| User Type | Username | Password |
| :--- | :--- | :--- |
| **🧑‍🏫 Teacher** | `TeacherJohn` | `JohnSmith025` |
| **👩‍🎓 Student** | `StudentGrace` | `GraceAdam2025` |

