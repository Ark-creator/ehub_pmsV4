# Getting Started with Ehub Project Management

## Welcome! 👋

This guide will help you get Ehub Project Management running on your computer.

## Installation (3 Simple Steps)

### Step 1: Install Node.js

Download and install Node.js 18 or higher from [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version
# Should show v18.0.0 or higher
```

### Step 2: Install Project Dependencies

Open your terminal in the project folder and run:

```bash
npm install
```

This will download all required packages. It may take a few minutes.

### Step 3: Start the Application

```bash
npm run dev
```

The application will start at **http://localhost:3000**

Open your web browser and navigate to that address.

## First Time Login

The application runs in demo mode by default, which means:
- You can use all features immediately
- Data is stored in memory (resets on refresh)
- No database setup required

To get started:
1. Open http://localhost:3000 in your browser
2. Use the login form to access the system
3. Create projects, tasks, and manage your team

## Next Steps

### For Development
- The app auto-reloads when you make changes to the code
- Check the browser console for any errors
- Edit files in the `components/` directory to customize

### For Production Use
- See [LOCALHOST_SETUP.md](./LOCALHOST_SETUP.md) for Supabase configuration
- This enables data persistence and additional features
- Follow the deployment guide in [README.md](./README.md)

## Need Help?

- **Can't install Node.js?** - Follow the official [Node.js installation guide](https://nodejs.org/en/download/package-manager/)
- **npm install fails?** - Try `npm cache clean --force` then `npm install` again
- **Port 3000 in use?** - The app will automatically use the next available port
- **Other issues?** - Check [LOCALHOST_SETUP.md](./LOCALHOST_SETUP.md) troubleshooting section

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality |

## What's Included

✅ Project management dashboard  
✅ Task tracking and assignment  
✅ User role management (Admin, Supervisor, Fabricator, Client)  
✅ Work logs and progress reports  
✅ Materials tracking  
✅ Revenue management  
✅ File uploads and documentation  
✅ Archives system  

## System Requirements

- **Node.js**: 18.0.0 or higher
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 500MB for node_modules
- **Browser**: Chrome, Firefox, Safari, or Edge (latest version)

---

**Ready to start?** Run `npm install` followed by `npm run dev` and you're all set! 🎉
