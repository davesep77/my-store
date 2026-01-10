# Deployment Guide

This project is configured for deployment on Vercel (Frontend) and PHP (Backend).

## IMPORTANT: Database Connection

The current project uses a **local MySQL database** (`localhost` via XAMPP).
**Deploying this to Vercel will NOT verify the database connection automatically.**

The Vercel application cannot connect to your `localhost` database.

### To make the deployment work fully:
1.  **Migrate your Database**: You must host your MySQL database online (e.g., Aiven, PlanetScale, DigitalOcean, or a VPS).
2.  **Update `api/db.php`**: Change the connection details (`$host`, `$user`, `$pass`, `$db`) to point to your **online** database.
    *   *Recommendation*: Use Environment Variables in Vercel to store these credentials securely, and modify `api/db.php` to read them (e.g., `getenv('DB_HOST')`).

## How to Deploy to GitHub & Vercel

1.  **Initialize Git**:
    ```bash
    git init
    git add .
    git commit -m "Initial commit for Vercel deployment"
    ```
2.  **Push to GitHub**:
    *   Create a new repository on GitHub (https://github.com/new).
    *   Run the commands shown by GitHub to push your code:
        ```bash
        git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
        git branch -M main
        git push -u origin main
        ```
3.  **Import to Vercel**:
    *   Go to https://vercel.com/new.
    *   Select your GitHub repository.
    *   Click **Deploy**.

The frontend will work immediately. The backend API calls will fail until you configure a remote database.
