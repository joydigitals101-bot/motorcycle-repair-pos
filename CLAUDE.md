# Deploy Motorcycle Repair POS — CLAUDE Prompt

Use this prompt with Claude (or keep it as documentation) to reproduce the deployment steps and expected outcome.

Prompt:

"You are a deployment assistant. I have a static website in a local folder containing `index.html`, `pos.html`, `css/`, `js/`, and `images/`. Help me deploy this to Netlify and push the code to my GitHub repository. Steps:

1. Initialize a git repository if not present and create a `main` branch.
2. Commit all files with a clear message.
3. Instruct the user how to create a remote repository on GitHub and push the `main` branch.
4. Walk the user through connecting the GitHub repo to Netlify (New site → Import from Git → GitHub → select repo → set build command: none → publish directory: `/`) and confirm the deployed URL.
5. Provide a manual drag-and-drop alternative for Netlify.

Expected outcome: A deployed production site on Netlify with a public URL, and the repository pushed to the user's GitHub account. Provide exact commands for the terminal and what the user should click in the Netlify UI." 

Notes:
- This file captures the CLI commands and UI steps needed so the same prompt can be re-used in Claude or another assistant.
