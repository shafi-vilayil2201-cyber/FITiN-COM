# Development & Deployment Workflow

## 1. Make Changes Locally
- **Frontend (UI)**: Edit files in the `src/` folder (e.g., components, pages, CSS).
- **Backend**: Edit files in the `backend/` folder (e.g., `server.js`, `db.json`).

## 2. Preview Changes
Always test your changes locally before deploying.

1.  Start the development server:
    ```bash
    npm run dev
    ```
2.  Open [http://localhost:5173](http://localhost:5173) in your browser.
3.  Make your edits. The browser will auto-update (Hot Module Replacement).

## 3. Deploy Changes
When you are happy with your work, push it to GitHub. This triggers automatic deployments on Vercel and Render.

1.  **Stage your changes**:
    ```bash
    git add .
    ```
2.  **Commit your changes**:
    ```bash
    git commit -m "Describe your changes here"
    ```
3.  **Push to GitHub**:
    ```bash
    git push
    ```

### What happens next?
- **Vercel (Frontend)**: Detects the push and updates your site automatically (~1-2 mins).
- **Render (Backend)**: Detects the push and updates your server automatically (~1-2 mins).
