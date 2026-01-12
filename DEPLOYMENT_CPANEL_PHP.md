## Ehub PMS – cPanel Deployment (PHP API + React Frontend)

This document explains how to deploy the converted PHP/MySQL backend and React frontend to a typical cPanel shared hosting environment using phpMyAdmin.

---

### 1. Requirements

- A cPanel account with:
  - PHP 8.x support
  - MySQL + phpMyAdmin
- Built React frontend (`npm run build`) from this project.

---

### 2. Create the MySQL Database (phpMyAdmin)

1. Log in to **cPanel**.
2. Open **MySQL® Databases**:
   - Create a database, e.g. `cpuser_ehub_pms`.
   - Create a MySQL user, e.g. `cpuser_ehub_user`, and set a strong password.
   - Add that user to the database with **ALL PRIVILEGES**.
3. Open **phpMyAdmin** from cPanel:
   - Select the database `cpuser_ehub_pms`.
   - Go to the **Import** tab.
   - Upload `database/ehub_pms_deployment.sql` from this repo.
   - Click **Go** to run the import.

---

### 3. Deploy the PHP API (`api/` folder)

1. In this repository, the PHP backend lives under the `api/` directory:
   - `api/config.php` – database + session config
   - `api/index.php` – main router and all endpoints
2. In cPanel, open **File Manager**:
   - Navigate to your document root (usually `public_html`).
   - Create a folder named `api` if it doesn’t exist.
   - Upload all files from the local `api/` directory into `public_html/api`, including:
     - `index.php`
     - `config.php`
     - `.htaccess`
3. Edit `public_html/api/config.php` and set your database credentials:

```php
$dbHost = 'localhost';                 // typical for shared hosting
$dbUser = 'cpuser_ehub_user';         // your MySQL user
$dbPass = 'your-strong-password';     // your MySQL user's password
$dbName = 'cpuser_ehub_pms';          // your database name
```

4. After upload, you should be able to hit:
   - `https://your-domain.com/api/health`
   - and get a JSON response like `{"status":"ok","timestamp":"..."}`.

---

### 4. Build and Upload the React Frontend

1. On your local machine:
   - Install deps if not already: `npm install`
   - Set the API base URL for production (optional). The default is `/api`, which works when API is on same domain:

```env
REACT_APP_API_URL=/api
```

   - Build: `npm run build`
2. In cPanel **File Manager**:
   - Under `public_html`, upload the contents of the build output directory (e.g. `dist/`).
   - Ensure `index.html` is at the document root (`public_html/index.html`).
   - Also upload the project root `.htaccess` file to `public_html/.htaccess` so that SPA routes (e.g. `/dashboard`) are all routed to `index.html`.

---

### 5. Routing and Authentication Details

- The frontend talks to the backend via relative URLs like `/api/...`, using `utils/apiService.ts`.
- The PHP backend:
  - Uses **PHP sessions** for authentication.
  - Exposes endpoints such as:
    - `POST /api/auth/login`
    - `POST /api/auth/signup`
    - `POST /api/auth/logout`
    - `GET  /api/auth/me`
    - `GET/POST /api/projects`
    - `GET/POST /api/tasks`
    - `GET/POST /api/worklogs`
    - `GET/POST /api/materials`
    - `GET  /api/users`
    - `POST /api/users/client`
- Because the frontend and backend are on the **same origin** (`https://your-domain.com`), the PHP session cookie is sent automatically and no extra CORS configuration is required on cPanel.

---

### 6. What Was Removed / No Longer Needed

The project previously used Node/Express and Supabase. These are no longer required for cPanel deployment:

- Removed Node backend files under `backend/`:
  - `backend/server.js`
  - `backend/package.json`
  - `backend/package-lock.json`
  - `backend/Dockerfile`
  - `backend/setup.js`
- Removed Supabase-specific files:
  - `supabase/index.tsx`
  - `supabase/kv_store.tsx`
  - `utils/supabase/info.tsx`
- Old Docker-based deployment, Nginx upstream `backend:3002` entries, and Node health-check commands are not needed for cPanel, but are kept in docs for reference if you ever use container hosting again.

---

### 7. Quick Smoke Test Checklist on cPanel

1. Visit `https://your-domain.com`:
   - The React app should load.
2. Visit `https://your-domain.com/api/health`:
   - Should return JSON with `"status": "ok"`.
3. Use the login form:
   - Try a default user from `ehub_pms_deployment.sql` (e.g. `admin@ehub.com` with `admin123`).
   - After login, refresh the page; you should remain authenticated thanks to PHP sessions.
4. Create a project, task, work log, and material entry:
   - Confirm they appear in the UI and in phpMyAdmin tables (`projects`, `tasks`, `work_logs`, `materials`).


