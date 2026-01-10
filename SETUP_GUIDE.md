# Setup Instructions

## 1. Database Setup
Since this project now uses a MySQL database instead of local storage, you need to set it up in XAMPP.

1.  **Start XAMPP**: Open XAMPP Control Panel and start **Apache** and **MySQL**.
2.  **Import Database**:
    *   Open your browser and go to `http://localhost/phpmyadmin`.
    *   Click **Import** in the top menu.
    *   Choose the file `database_setup.sql` located in this project folder.
    *   Click **Go** (bottom right).
    *   *Alternatively*, you can try running `php setup_db.php` in the terminal if you have PHP configured in your PATH and no root password set.

## 2. API Configuration
The backend API is located in the `api/` folder.
*   **Database Connection**: Check `api/db.php`. If you have a password for your MySQL `root` user, allow edit this file and update the `$pass` variable.
*   **Base URL**: The frontend connects to `http://localhost/my-store-inventory-manager%20(1)/api`. If you rename the project folder, update `services/api.ts` accordingly.

## 3. Running the Frontend
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
3.  Open the link shown (usually `http://localhost:5173`).

## Troubleshooting
*   **Error connecting to backend**: Ensure XAMPP is running. Check the Network tab in browser developer tools (F12) to see if requests to `api/items.php` are failing.
*   **CORS Errors**: The `api/db.php` handles CORS. If you see CORS errors, ensure Apache is configured to allow `.htaccess` or the headers in PHP are being sent correctly.
