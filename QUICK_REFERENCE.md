# Quick Reference Card

## 🚀 Run Locally

```bash
npm install && npm run dev
```

Open: **http://localhost:3000**

## 📁 Project Structure

```
├── components/          # React components
│   ├── auth/           # Login & authentication
│   ├── dashboard/      # Dashboard widgets
│   ├── projects/       # Project management
│   ├── tasks/          # Task management
│   ├── users/          # User management
│   └── ui/             # Reusable UI components
├── supabase/           # Backend edge functions
├── utils/              # Helper functions
├── types/              # TypeScript definitions
└── styles/             # Global styles
```

## 🔧 Common Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality |

## 🎨 Color Palette

- **Primary (Background)**: `#103054` - Dark blue
- **Accent**: `#E1862D` - Orange
- **Foreground**: `#FFFFFF` - White

## 👥 User Roles

1. **Admin** - Full system access
2. **Supervisor** - Project management, team coordination
3. **Fabricator** - Task execution, work logs
4. **Client** - View project status and documentation

## 🔐 Security Features

- Unique secure IDs (FAB001, SUP001, ADM001, etc.)
- Role-based access control
- Password encryption
- Session management

## 📱 Key Features

✅ Project & task management  
✅ Work logs & progress tracking  
✅ Materials management  
✅ Revenue tracking  
✅ File uploads  
✅ Email notifications  
✅ Archives system  
✅ Client portal  
✅ Mark as Done (Projects & Tasks)  

## 🌐 Environment Setup

Optional - for database persistence:

1. Copy `.env.example` to `.env.local`
2. Add your Supabase credentials
3. Deploy edge functions: `supabase functions deploy`

## 📚 Documentation

- [GETTING_STARTED.md](./GETTING_STARTED.md) - Beginner's guide
- [LOCALHOST_SETUP.md](./LOCALHOST_SETUP.md) - Detailed setup
- [README.md](./README.md) - Full documentation
- [REVENUE_FEATURES.md](./REVENUE_FEATURES.md) - Revenue system

## 🐛 Troubleshooting

**Port in use?**
```bash
# Kill process on port 3000 (Unix/Mac)
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Dependencies fail?**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Build errors?**
```bash
npm run lint
# Fix any errors shown
npm run build
```

## 🔗 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

## 📊 Default Ports

- Development: `http://localhost:3000`
- Preview: `http://localhost:4173`

---

**Need more help?** Check [GETTING_STARTED.md](./GETTING_STARTED.md)
