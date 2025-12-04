# Hano
An Interactive Vocabulary Learning Platform for Hearing-Impaired Grade 3 Students.

<br>

## Frontend for Hano
Uses the React library for building a dynamic, responsive, and interactive user interface.

### Frontend Stack
- <strong>Vite v6.2.4</strong> – Build tool and development server
- <strong>React.js v19.0.0</strong> – Core JavaScript library for building the UI
- <strong>React Router v7.4.1</strong> – Handles navigation between pages
- <strong>Material UI (MUI) v7.0.1</strong> – Pre-built React components for styling and icons
- <strong>Tailwind CSS v4.1.1</strong> – Utility-first CSS framework for responsive design
- <strong>Emotion v11.14.0</strong> – CSS-in-JS styling library

### State Management & Authentication
- <strong>Axios</strong> – Handles HTTP requests to the backend
- <strong>JWT Decode</strong> – Decodes JSON Web Tokens for authentication

### Installation:
1. Navigate to your main app folder (Hano)
```
cd Hano
```
2. Clone the repository
```
git clone https://github.com/G41-Hano/frontend.git
```
3. Navigate to the frontend folder
```
cd frontend
```
4. Create a <strong>.env file<strong>
5. Paste this inside the <strong>.env file<strong>
```
VITE_API_URL = ""
```
> <i>Note: paste the URL provided when running the backend server</i> <br>
> Example: VITE_API_URL = "http://localhost:8000"
6. Install the dependencies
```
npm install
```
7. Run the server
```
npm run dev
```

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
        | **`VITE_API_URL`** | *https://backend-o2s1.onrender.com* | **Production, Preview, Development** |
6.  **Deploy:** Click **"Deploy"**. The application will now build and be live at the provided Vercel URL.

### 🔄 Continuous Deployment

* **Production:** Pushes to the **`main`** branch will automatically trigger a new build and update the production URL.
* **Preview:** Opening a Pull Request (PR) against the `main` branch will trigger a **Preview Deployment** with a unique URL, allowing for testing before merging.

### Sample Credentials for Testing:
1. Teacher
- Username:
```
TeacherJohn
```
- Password:
```
JohnSmith025
```

2. Student
- Username:
```
StudentGrace
```
- Password:
```
GraceAdam2025
```