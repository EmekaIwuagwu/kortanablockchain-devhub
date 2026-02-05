# Kortana Studio IDE - Production System Prompt

## Project Overview
You are architecting and developing **Kortana Studio**, a professional-grade blockchain IDE designed for the Kortana Blockchain. The IDE enables developers to write, compile, deploy, and test smart contracts written in both **Solidity** and **Quorlin** (a Python-inspired language). The IDE must rival industry standards like Remix IDE and Visual Studio Code in both functionality and aesthetics.

**Distribution Models:**
1. **Desktop Applications**: Native installers for Windows (.exe), macOS (.dmg), and Linux (.AppImage/.deb)
2. **Web IDE**: Cloud-hosted SaaS platform accessible via browser (no installation needed)
3. **Unified Codebase**: Single source of truth with platform-specific adaptations

**Technology Stack:**

*Core Frontend (Shared across all platforms):*
- Language: TypeScript with strict mode
- UI Framework: React 18+ with Hooks and Context API
- Styling: Tailwind CSS + CSS Modules + Global CSS3
- State Management: Redux Toolkit for centralized state
- Build Tool: Vite for HMR and optimized production builds
- Code Editor: Monaco Editor (VS Code editor component)

*Desktop Applications (Electron-based):*
- Framework: Electron 30+ with native Node.js integration
- Main Process: Node.js for file system, OS interactions
- Preload Scripts: Secure IPC between renderer and main process
- File System: Native file access via Electron APIs (fs, path)
- Local Backend: C# .NET 8+ running as background service
- Auto-update: electron-updater with staged rollouts
- System Integration: Native menu bars, file associations, context menus, OS notifications
- Packaging: electron-builder for cross-platform builds

*Web IDE (SaaS - Cloud Hosted):*
- Frontend Hosting: AWS S3 + CloudFront CDN or Vercel/Netlify
- API Gateway: Express.js or Fastify middleware
- Authentication: OAuth 2.0 (GitHub, Google), JWT tokens
- Database: PostgreSQL for user accounts, projects, deployment history
- Session Management: Redis for user sessions and rate limiting
- WebSocket: Real-time compilation feedback and deployment status
- File Storage: Cloud storage (AWS S3) for project files
- Monitoring: Sentry for error tracking, Datadog for performance metrics

*Backend Services (Shared - Docker containerized):*
- Language: C# (.NET 8+)
- Framework: ASP.NET Core 8+ for REST APIs and WebSocket support
- Compiler Services: Microservices for Solidity and Quorlin compilation
- RPC Integration: ethers.js or web3.js for blockchain interaction
- Container Runtime: Docker for platform consistency
- Orchestration (Web only): Kubernetes for scaling and load balancing

*Project Synchronization:*
- Desktop: Local Git-based storage with cloud sync option
- Web: Cloud-based with real-time sync
- Sync Protocol: Delta sync to minimize bandwidth

---

## Core Functionality Requirements

### 1. Multi-Language Support
- **Solidity Compilation**: Full EVM-compatible smart contract compilation with error reporting
- **Quorlin Compilation**: Python-inspired language compilation targeting Kortana Blockchain
  - Reference: https://www.quorlin.dev
  - Must support all Quorlin language features and syntax
  - Proper error handling and debugging output

### 2. Project Workflow
The IDE must implement a seamless workflow with the following flow:

```
IDE Launch 
  ↓
Main Menu Interface (with all controls visible)
  ↓
New Project Creation
  ↓
Language Selection (Solidity / Quorlin)
  ↓
Code Editor (with full IDE features)
  ↓
Code Compilation & Validation
  ↓
Deployment Selection (Testnet / Mainnet)
  ↓
Smart Contract Testing Interface
  ↓
Runtime Interaction & Behavior Verification
```

### 3. Code Editor
- **Visual Studio Code Aesthetics**: Adopt VS Code's UI/UX paradigm
  - Sidebar navigation with file explorer
  - Tabbed editor interface
  - Status bar with real-time compilation status
  - Command palette for quick actions
  - Integrated terminal for deployment logs
  
- **Code Features**:
  - Syntax highlighting for both Solidity and Quorlin
  - IntelliSense/autocomplete powered by language servers
  - Real-time error underlines and diagnostic messages
  - Bracket matching and auto-indentation
  - Code formatting (Prettier-style for TypeScript implementation)
  - Line numbers and code folding

### 4. Compilation System
- **Backend Compiler Service** (C#):
  - Solidity compiler integration (solc binary or web3j)
  - Quorlin compiler implementation with full AST generation
  - Error and warning collection with precise line/column tracking
  - ABI generation for both languages
  - Bytecode optimization
  - Return compilation artifacts (ABI, bytecode, source map)

- **Frontend Compilation UI**:
  - Real-time compilation feedback
  - Error panel showing all issues with navigate-to-error functionality
  - Warnings and info messages with severity levels
  - Compilation time metrics

### 5. Network Configuration & Deployment

**Testnet Configuration** (Primary):
- RPC Endpoint: `https://poseidon-rpc.kortana.worcester.xyz/`
- Network ID: Kortana Testnet
- Gas estimation and fee preview
- Transaction confirmation tracking

**Mainnet Configuration** (Future):
- RPC placeholder for mainnet deployment
- Environment variable management
- Network switching controls

**Deployment Features**:
- Wallet connection integration (MetaMask, WalletConnect)
- Constructor parameter input UI
- Gas price and limit customization
- Pre-deployment validation
- Deployment progress indicator
- Transaction hash and deployment address display
- Deployment history and management

### 6. Smart Contract Testing Interface
Post-deployment, present a professional testing interface with:

**Contract Interaction Panel**:
- Auto-generated UI based on ABI
- Function list with categorization (read-only / state-modifying)
- Parameter input fields with type validation
- Call/transaction execution buttons
- Gas cost estimation

**Testing Features**:
- State variable inspection and monitoring
- Function call execution with parameter passing
- Transaction receipt viewing
- Event log display and filtering
- Error message propagation
- Call history and playback
- Mock scenario testing (if applicable)

**Output & Results**:
- Return value display with type formatting
- Execution gas cost display
- Block number and timestamp tracking
- Raw transaction data inspection

---

## Design & Aesthetics Requirements

### Visual Design System
Adopt **VS Code Dark Pro** or **One Dark Pro** theme as the baseline:

**Color Palette**:
- Primary Background: `#1e1e1e` (VS Code dark background)
- Secondary Background: `#252526` (Sidebar background)
- Accent Color: `#007acc` (VS Code blue)
- Text Primary: `#d4d4d4`
- Text Secondary: `#858585`
- Danger/Error: `#f48771`
- Success: `#4ec9b0`
- Warning: `#dcdcaa`

**Typography**:
- Monospace Font: "Cascadia Code", "Fira Code", or fallback to system monospace
- UI Font: "Segoe UI", "-apple-system", "BlinkMacSystemFont"
- Base Size: 13px for editor, 12px for UI elements

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  [Menu Bar] File Edit View Run Deploy Tools Help        │
├────────────────┬──────────────────────────┬─────────────┤
│                │                          │             │
│  File Sidebar  │  Code Editor             │ Right Panel │
│  - Explorer    │  - Tabs                  │ - Compiler  │
│  - Search      │  - Code                  │ - Errors    │
│  - Git         │  - Gutter                │ - Output    │
│  - Run/Deploy  │  - Mini map              │ - Tests     │
│                │                          │             │
├────────────────┴──────────────────────────┴─────────────┤
│ Status Bar: [Compiler: OK] | [Network: Testnet] |      │
│ [Gas: 21000] | Ready                                    │
└────────────────────────────────────────────────────────┘
```

### Visual Polish
- Smooth transitions (200-300ms) for panel interactions
- Glassmorphism effects for overlays and modals
- Box shadows matching VS Code depth levels
- Hover states with subtle color shifts
- Focus states with clear visual indicators
- Loading spinners with branded animation
- Toast notifications for deployment confirmations
- Tooltips for all action buttons

### Responsive Design
- Optimize for 1440px+ as primary (developer screens)
- Flexible sidebar collapsing
- Resizable panels with intuitive dividers
- Fullscreen code editor mode
- Mobile-friendly dialogs (though IDE targets desktop)

---

## Distribution Architecture

### Desktop Application Architecture

#### Windows Distribution (.exe installer)

**Installation:**
- NSIS (Nullsoft Scriptable Install System) installer
- One-click installation to `%AppData%\KortanaStudio` or user-selected directory
- System registry entries for file association (.sol, .qrl files)
- Start menu shortcuts and desktop shortcut
- Add/Remove Programs entry with uninstaller

**Startup Flow:**
```
1. User launches Kortana Studio.exe
   ↓
2. Electron main process initializes
   ↓
3. Local C# backend service starts (if not already running)
   ↓
4. Renderer process loads React UI
   ↓
5. UI connects to local backend via IPC
   ↓
6. IDE is ready for use
```

**Key Features:**
- Lightweight installer (~300MB)
- Auto-updates via electron-updater (checks every 24h)
- Native Windows file explorer integration
- Context menu: "Open with Kortana Studio"
- Windows notifications for deployment status
- Dark mode respects Windows theme preference

**System Requirements:**
- Windows 10 or later (x64)
- 2GB RAM minimum, 4GB recommended
- 500MB disk space
- .NET 8 Runtime (bundled if needed)

---

#### macOS Distribution (.dmg package)

**Installation:**
- Disk image (.dmg) with drag-and-drop installer
- Code-signed with Apple Developer Certificate
- Notarized for Gatekeeper security
- Installed to `/Applications/Kortana Studio.app`

**Startup Flow:**
```
1. User opens Kortana Studio from Applications folder
   ↓
2. macOS verifies signature and notarization
   ↓
3. Electron app bundle initializes
   ↓
4. Local backend service starts
   ↓
5. React UI loads with native macOS UI conventions
```

**Key Features:**
- Native .app bundle with correct structure
- macOS menu bar integration
- Command+Shift+B for compile (native shortcut)
- Spotlight search integration (optional)
- Cmd+Q to quit (native convention)
- macOS Dark/Light mode automatic detection
- Auto-updates with Sparkle or electron-updater

**System Requirements:**
- macOS 11 or later (x86_64 and ARM64 Universal Binary)
- 2GB RAM minimum
- 500MB disk space

---

#### Linux Distribution (.AppImage and .deb)

**AppImage Distribution:**
- Self-contained executable (.AppImage format)
- No installation required - just make executable and run
- Portable across all Linux distributions
- ~350MB download

**Debian/Ubuntu Distribution (.deb package):**
```bash
sudo apt install ./kortana-studio_1.0.0_amd64.deb
# User runs: kortana-studio (command line launch)
```

**Installation:**
- .deb package for Debian-based systems (Ubuntu, Pop!_OS, Linux Mint)
- Installs to `/opt/kortana-studio/`
- Desktop entry file for application menu
- systemd service for background backend

**Startup Flow:**
```
1. User launches kortana-studio from terminal or menu
   ↓
2. Electron main process starts
   ↓
3. Backend service starts (if using system-wide installation)
   ↓
4. UI initializes with Linux theme conventions
```

**Key Features:**
- Works on Ubuntu 20.04+, Debian 11+
- Respects GTK theme for dark/light mode
- Native file manager integration
- systemd service for reliable backend process
- Can be launched from command line

**System Requirements:**
- Linux kernel 5.0+
- glibc 2.29+
- 2GB RAM minimum
- 500MB disk space

---

### Web IDE Architecture

#### SaaS Platform Access

**URL:** `https://studio.kortana.io/` or `https://ide.kortana.io/`

**Access Methods:**
1. Direct browser access (no installation)
2. Browser bookmark or PWA installation
3. Mobile browser support (tablet-friendly, limited features on phone)

**Authentication Flow:**
```
User visits https://studio.kortana.io/
   ↓
Redirected to login if not authenticated
   ↓
OAuth 2.0 provider selection: [GitHub] [Google] [Email]
   ↓
User grants permission to access profile
   ↓
JWT token issued and stored in HttpOnly cookie
   ↓
User dashboard loads with project list
   ↓
User can create new project or open existing
```

**Project Management (Web):**
- Cloud storage of all project files (AWS S3)
- Real-time sync across devices
- Automatic backup every 30 minutes
- Version history with rollback capability
- Shareable project links (read-only or collaborative)
- Team collaboration features (optional premium)

**Offline Mode (PWA):**
- Progressive Web App with offline support
- Service Worker caches UI and critical assets
- Code editing available offline
- Compilation queued until connection restored
- Auto-sync when back online

**Deployment from Web:**
- No wallet extension needed if using web3modal/rainbowkit
- QR code for mobile wallet signing
- WalletConnect integration for hardware wallets
- Transaction broadcast to Kortana testnet RPC

---

### Platform-Specific UI Adaptations

#### Desktop-Specific UI Features:
- Native file open/save dialogs
- Drag-and-drop from file explorer
- Native context menus
- System tray integration (optional)
- Full keyboard shortcut customization
- Native notification system

#### Web-Specific UI Features:
- Browser address bar with workspace URLs
- Share/collaborate buttons
- Account dropdown in top-right
- PWA install button (prompts browser install)
- Cloud sync status indicator
- Team member avatars (collaboration)
- Settings stored in user database

#### Responsive Design:
```
Desktop: 1440px+ (primary target)
├─ Full sidebar + editor + right panel
├─ All menus visible
└─ Optimal workspace utilization

Tablet: 768px - 1440px
├─ Collapsible sidebar
├─ Editor takes 70% width
└─ Right panel accessible via tabs

Mobile: < 768px
├─ Bottom navigation bar
├─ Full-width single pane
├─ Code viewer only (limited editing)
└─ Testing interface simplified
```

---

### Synchronization & Data Management

#### Desktop Sync (Local-First):
```
Local Project
   ↓
(Optional) Cloud Sync
   ↓
Cloud Project (S3 + Database)
```

**Flow:**
1. All work stored locally first (no lag)
2. User can enable "Cloud Sync" setting
3. Changes automatically uploaded to cloud
4. Conflict resolution: Local version wins (configurable)
5. Can access projects on web IDE if synced

**Storage Paths:**
- Windows: `C:\Users\{username}\AppData\Local\KortanaStudio\Projects\`
- macOS: `~/Library/Application Support/KortanaStudio/Projects/`
- Linux: `~/.config/KortanaStudio/Projects/` or `~/.local/share/KortanaStudio/`

#### Web Sync (Cloud-First):
```
Browser UI
   ↓
Autosave to Cloud (every 5 seconds or on blur)
   ↓
Database + S3 Storage
   ↓
WebSocket Notification (real-time feedback)
```

**Features:**
- Real-time collaborative editing (future)
- Automatic conflict merging
- Version history with timestamps
- Restore previous versions (last 30 days)
- Export project as ZIP

#### Cross-Platform Sync:
```
Desktop Project
   ↓
Enable "Cloud Sync"
   ↓
Upload to Cloud
   ↓
Login to Web IDE
   ↓
Project appears in web IDE
   ↓
Edit on web
   ↓
Sync back to Desktop
```

**Sync Conflict Resolution:**
- Last-write-wins (configurable)
- Merge-based (show diff, resolve manually)
- Desktop takes precedence (for offline-first users)

---

### Backend Service Management

#### Desktop Backend Service

**Service Lifecycle:**
```
Application Startup
   ↓
Check if backend process running
   ├─ Yes: Connect to existing process
   └─ No: Start new backend service
   ↓
Backend listens on localhost:5000
   ↓
Renderer process connects via IPC
   ↓
Compilation requests processed locally
   ↓
RPC calls forwarded to blockchain
```

**Local Backend Processes:**
- Solidity compiler service (solc binary)
- Quorlin compiler service (.NET executable)
- Local cache for compiled contracts
- Project file system watcher
- Auto-compile on file save (optional)

**System Tray (Optional):**
- Show backend status
- Quick access to recent projects
- Exit/quit application
- Settings shortcut

#### Web Backend Service (Kubernetes)

**Deployment Architecture:**
```
Load Balancer (AWS ELB)
   ↓
API Gateway (Nginx/Istio)
   ↓
┌─────────────────────────────────────────┐
│ Kubernetes Cluster (Auto-scaling)      │
├─────────────────────────────────────────┤
│ Pod 1: Express.js API Server           │
│ Pod 2: Express.js API Server           │
│ Pod 3: C# Solidity Compiler Service    │
│ Pod 4: C# Quorlin Compiler Service     │
│ Pod 5: RPC Relay & Rate Limiter        │
└─────────────────────────────────────────┘
   ↓
Persistent Services
├─ PostgreSQL (User data, projects)
├─ Redis (Sessions, rate limiting, caching)
└─ AWS S3 (Project file storage)
```

**Auto-scaling Rules:**
- Scale up: If CPU > 70% or queue depth > 50
- Scale down: If CPU < 30% for 10 minutes
- Minimum replicas: 2 (high availability)
- Maximum replicas: 10 (cost control)

---

### Update & Release Management

#### Desktop Auto-Updates

**Update Check Process:**
```
Application Startup
   ↓
Check for updates (every 24h or on-demand)
   ↓
Download latest version in background
   ↓
Notify user: "Update available"
   ↓
User clicks "Install & Restart"
   ↓
Installer runs (delta update for speed)
   ↓
Application relaunches
```

**Rollout Strategy:**
- Staged rollout: 10% → 50% → 100%
- Automatic rollback if crash rate > 5%
- Beta channel for testing (opt-in)
- Major version bumps require manual trigger

#### Web IDE Updates

**Continuous Deployment:**
```
Developer pushes code
   ↓
CI/CD pipeline (GitHub Actions)
   ↓
Automated tests pass
   ↓
Build Docker container
   ↓
Push to container registry
   ↓
Deploy to staging environment
   ↓
Smoke tests pass
   ↓
Deploy to production (blue-green deployment)
   ↓
Users see new version on next page load
```

**Zero-downtime Updates:**
- Blue-green deployment strategy
- Database migrations are backward-compatible
- API versioning for backward compatibility
- Service workers handle version mismatch

---

### Frontend (TypeScript/React) - Shared Across Platforms
```
/src
  /components (Shared across Desktop and Web)
    /Editor
      - CodeEditor.tsx (Monaco Editor with platform detection)
      - EditorTabs.tsx
      - EditorGutter.tsx
      - FileDrop.tsx (Drag-drop for desktop)
    /Sidebar
      - FileExplorer.tsx (Platform-specific file ops)
      - ProjectTree.tsx
      - DeploymentPanel.tsx
    /Compiler
      - CompilerOutput.tsx
      - ErrorPanel.tsx
      - WarningsPanel.tsx
    /Testing
      - ContractInteraction.tsx
      - FunctionCaller.tsx
      - StateInspector.tsx
      - EventLog.tsx
    /Network
      - NetworkSelector.tsx
      - WalletConnection.tsx (Platform-specific wallet logic)
      - DeploymentModal.tsx
    /Auth (Web-only)
      - LoginPage.tsx
      - OAuthCallback.tsx
      - UserProfile.tsx
    /Common
      - Navbar.tsx (Platform-aware)
      - StatusBar.tsx (Shows sync status on web)
      - Terminal.tsx
      - Notifications.tsx (Native on desktop, toast on web)
  /services
    - CompilerService.ts (Routes to local or cloud backend)
    - DeploymentService.ts (RPC interactions)
    - WalletService.ts (MetaMask, WalletConnect, Web3Modal)
    - StorageService.ts (Desktop: fs, Web: S3 + DB)
    - SyncService.ts (Desktop-to-cloud sync logic)
    - AuthService.ts (Web-only JWT management)
  /hooks
    - useCompiler.ts
    - useDeployment.ts
    - useWallet.ts
    - useProject.ts
    - usePlatform.ts (Detect platform: 'desktop' | 'web')
    - useSync.ts (Web: cloud sync, Desktop: optional)
  /types
    - index.ts (Shared interfaces)
    - platform.ts (Platform-specific types)
  /styles
    - global.css (Shared theme)
    - desktop.css (Desktop-only styles)
    - web.css (Web-only styles)
    - theme.css (VS Code theme)
  /store
    - editorStore.ts
    - projectStore.ts
    - deploymentStore.ts
    - authStore.ts (Web-only)
    - syncStore.ts (Sync status)
  /utils
    - platformDetect.ts
    - fileHandlers.ts (Platform-specific)
    - syncUtils.ts
```

#### Platform Detection (useContext):
```typescript
// usePlatform.ts
export const usePlatform = () => {
  const [platform, setPlatform] = useState<'desktop' | 'web' | 'loading'>('loading');

  useEffect(() => {
    if (window.electron) {
      setPlatform('desktop');
    } else if (window.location.hostname !== 'localhost') {
      setPlatform('web');
    }
  }, []);

  return platform;
};

// Usage:
const platform = usePlatform();
if (platform === 'desktop') {
  // Show native file dialogs
} else if (platform === 'web') {
  // Show cloud sync status
}
```

---

### Desktop Application (Electron + C#) Structure

#### Electron Main Process (TypeScript):
```
/electron
  /main
    - index.ts (Electron app entry)
    - ipc-handlers.ts (IPC event listeners)
    - window-manager.ts (Manage app windows)
    - auto-updater.ts (electron-updater config)
    - menu.ts (Native menu bar)
    - tray.ts (System tray icon)
    - backend-manager.ts (Start/stop C# service)
  /preload
    - index.ts (Secure IPC bridge)
  /utils
    - paths.ts (OS-specific paths)
    - logger.ts (Winston logging)
```

#### IPC Communication (Desktop):
```typescript
// Renderer → Main
ipcRenderer.invoke('compiler:compile', {
  language: 'solidity',
  sourceCode: '...'
});

// Main → Renderer
ipcMain.handle('compiler:compile', async (event, payload) => {
  const result = await backendService.compile(payload);
  return result;
});

// Main → Renderer (Events)
ipcRenderer.on('deployment:status', (event, status) => {
  updateUI(status);
});

mainWindow.webContents.send('deployment:status', deploymentStatus);
```

#### C# Backend Service:
```
/KortanaStudio.Backend
  /Services
    - LocalCompilerService.cs (Solidity, Quorlin)
    - LocalDeploymentService.cs
    - LocalRPCService.cs
    - LocalProjectService.cs (File system ops)
  /Controllers
    - CompilerController.cs (Listen on localhost:5000)
    - DeploymentController.cs
    - ProjectController.cs
  /Models
    - (Same as web backend)
  /Config
    - AppSettings.json (Local configuration)
```

#### Native Menu Bar (Desktop):

```typescript
// menu.ts
const template: MenuItemConstructorOptions[] = [
  {
    label: 'File',
    submenu: [
      { label: 'New Project', accelerator: 'CmdOrCtrl+N' },
      { label: 'Open Project', accelerator: 'CmdOrCtrl+O' },
      { label: 'Recent', submenu: recentProjects },
      { type: 'separator' },
      { label: 'Save', accelerator: 'CmdOrCtrl+S' },
      { label: 'Save All', accelerator: 'CmdOrCtrl+Shift+S' },
      { type: 'separator' },
      { label: 'Exit', accelerator: 'CmdOrCtrl+Q' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z' },
      { label: 'Redo', accelerator: 'CmdOrCtrl+Shift+Z' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V' }
    ]
  },
  {
    label: 'Build',
    submenu: [
      { label: 'Compile', accelerator: 'CmdOrCtrl+Shift+B' },
      { label: 'Deploy', accelerator: 'CmdOrCtrl+Shift+D' }
    ]
  },
  {
    label: 'Help',
    submenu: [
      { label: 'Documentation', click: () => shell.openExternal('https://docs.kortana.io') },
      { label: 'About Kortana Studio' }
    ]
  }
];
```

---

### Web Application (Express + React) Structure

#### Express.js API Server:
```
/server
  /middleware
    - auth.ts (JWT verification)
    - rateLimit.ts (Rate limiting per user)
    - errorHandler.ts
    - cors.ts
  /routes
    - auth.ts (/api/auth/*)
    - projects.ts (/api/projects/*)
    - compiler.ts (/api/compiler/*)
    - deployment.ts (/api/deployment/*)
  /controllers
    - AuthController.ts
    - ProjectController.ts
    - CompilerController.ts
    - DeploymentController.ts
  /services
    - UserService.ts
    - ProjectService.ts (PostgreSQL + S3)
    - AuthService.ts (OAuth2, JWT)
    - CompilerService.ts (Microservice call)
    - DeploymentService.ts
    - SyncService.ts (WebSocket for real-time updates)
  /models
    - User.ts
    - Project.ts
    - Deployment.ts
  /config
    - database.ts (PostgreSQL connection)
    - redis.ts (Session store)
    - s3.ts (AWS S3 config)
    - oauth.ts (GitHub, Google providers)
  /utils
    - logger.ts (Structured logging)
    - errorHandler.ts
```

#### WebSocket Connection (Real-time Updates):
```typescript
// Server
io.on('connection', (socket) => {
  socket.on('compile:start', async (data) => {
    const result = await compilerService.compile(data);
    socket.emit('compile:result', result);
  });

  socket.on('deployment:watch', (txHash) => {
    const unsubscribe = deploymentService.watchTx(txHash, (status) => {
      socket.emit('deployment:status', status);
    });
    socket.on('disconnect', unsubscribe);
  });
});

// Client
const socket = io('https://api.studio.kortana.io/');
socket.emit('compile:start', { language: 'solidity', code: '...' });
socket.on('compile:result', (result) => {
  updateCompilerUI(result);
});
```

#### Authentication Flow (Web):
```typescript
// OAuth callback from GitHub/Google
POST /api/auth/callback
Body: { code: 'oauth_code', state: 'random_state' }
   ↓
Exchange code for access token
   ↓
Get user profile from provider
   ↓
Find or create user in DB
   ↓
Issue JWT token
   ↓
Set HttpOnly cookie
   ↓
Redirect to dashboard

// All subsequent requests include JWT in header or cookie
Authorization: Bearer <jwt_token>
```

#### Database Schema (PostgreSQL):
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  github_id VARCHAR(255) UNIQUE,
  google_id VARCHAR(255) UNIQUE,
  display_name VARCHAR(255),
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  language VARCHAR(50), -- 'solidity' or 'quorlin'
  s3_key VARCHAR(500), -- S3 path to files
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Deployments table
CREATE TABLE deployments (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  network VARCHAR(50), -- 'testnet' or 'mainnet'
  contract_address VARCHAR(255),
  transaction_hash VARCHAR(255),
  block_number BIGINT,
  gas_used BIGINT,
  deployed_at TIMESTAMP DEFAULT NOW()
);

-- Sync records
CREATE TABLE sync_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  source VARCHAR(50), -- 'desktop' or 'web'
  content_hash VARCHAR(64),
  synced_at TIMESTAMP DEFAULT NOW()
);
```

---

### Deployment Pipelines

#### Desktop Installer Build Pipeline (GitHub Actions):

```yaml
name: Build Desktop Installers

on:
  release:
    types: [created]

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build Windows installer
        run: npm run build:win
      - name: Upload to release
        uses: softprops/action-gh-release@v1
        with:
          files: dist/*.exe

  build-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Build macOS dmg
        run: npm run build:mac
      - name: Upload to release
        uses: softprops/action-gh-release@v1
        with:
          files: dist/*.dmg

  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Build Linux AppImage and deb
        run: npm run build:linux
      - name: Upload to release
        uses: softprops/action-gh-release@v1
        with:
          files: dist/*.(AppImage|deb)
```

#### Web IDE Deployment Pipeline (GitHub Actions + Docker):

```yaml
name: Deploy Web IDE

on:
  push:
    branches: [main]

jobs:
  test-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - name: Build Docker image
        run: docker build -t kortana-studio:${{ github.sha }} .
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push kortana-studio:${{ github.sha }}

  deploy:
    needs: test-and-build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/kortana-studio \
            app=kortana-studio:${{ github.sha }} \
            --record
      - name: Wait for rollout
        run: kubectl rollout status deployment/kortana-studio
```

---

---

## Feature Specifications

### 1. File Management
- Create new Solidity/Quorlin files
- Folder structure with drag-and-drop support
- .sol file extensions for Solidity, .qrl for Quorlin
- Project configuration file (.kortana.json) for metadata
- Import/export projects as .zip archives

### 2. Compilation Pipeline

**On Save**:
- Automatic lint checking
- Incremental compilation caching
- Background compilation without blocking editor

**On Explicit Compile**:
- Full project compilation
- Dependency resolution
- Import graph visualization (optional)
- Detailed error reporting with file references

**Output Artifacts**:
```json
{
  "compilation": {
    "status": "success|error",
    "language": "solidity|quorlin",
    "timestamp": "2025-02-03T...",
    "errors": [],
    "warnings": [],
    "contracts": [
      {
        "name": "MyContract",
        "abi": [],
        "bytecode": "0x...",
        "deployedBytecode": "0x...",
        "sourceMap": "..."
      }
    ]
  }
}
```

### 3. Deployment Flow

**Pre-Deployment Checklist**:
- [ ] Code compiles without errors
- [ ] Network selected (Testnet/Mainnet)
- [ ] Wallet connected
- [ ] Constructor parameters entered (if applicable)
- [ ] Gas estimation reviewed

**Deployment Steps**:
1. Validate compilation artifacts
2. Display deployment modal with summary
3. Connect to RPC endpoint (testnet: `https://poseidon-rpc.kortana.worcester.xyz/`)
4. Sign transaction with wallet
5. Submit transaction to network
6. Poll for confirmation (max 5 minutes)
7. Display deployment confirmation with contract address
8. Automatically load contract for testing

**Error Handling**:
- Network timeout → Retry with exponential backoff
- Gas estimation failure → Show manual gas input
- Wallet rejection → Clear UI state and allow retry
- RPC errors → Display user-friendly messages with troubleshooting

### 4. Smart Contract Testing

**Auto-Generated Testing UI** (from ABI):
```tsx
<ContractInteraction
  abi={contractABI}
  address={deployedAddress}
  provider={Web3Provider}
/>
```

**Function Interaction**:
- Input validation per ABI type (uint256, address, string, etc.)
- Payable function detection with value input
- Array/tuple parameter handling
- Enum parameter selection

**Result Display**:
- Return types formatted with proper parsing
- Big number handling (ethers.js BigNumber)
- Event emissions displayed in real-time
- Call history with replay functionality

### 5. Real-Time Feedback

**Status Indicators**:
- Compilation status in status bar
- Network connection status
- Wallet connection status
- RPC node health

**Console/Terminal**:
- Compiler output logs
- Deployment transaction logs
- RPC request/response logging (dev mode)
- Console.log style output from contracts (if supported)

---

## User Experience Flow - Detailed

### First Launch
1. Welcome screen with project creation options
2. Guided tutorial (skippable)
3. Theme selection (Light/Dark)
4. Default project creation wizard

### Creating a New Project
```
Step 1: Project Name & Location
  Input: Project name, default location (~/KortanaStudio/Projects)
  
Step 2: Language Selection
  Button Group: [Solidity] [Quorlin]
  Show language description and example code snippet
  
Step 3: Template Selection
  Options: 
    - Blank project
    - Hello World (language-specific example)
    - ERC20 Token (Solidity) / Equivalent (Quorlin)
    - Multi-contract template
  
Step 4: Project Configuration
  - Network: Testnet (default) / Mainnet (when available)
  - Compiler version (dropdown with latest as default)
  - Initialize git (checkbox)
  
Step 5: Creation
  - Show progress spinner
  - Generate project structure
  - Open IDE immediately upon completion
```

### Code Editing Session
1. File tree visible on left
2. Main editor in center with tab management
3. Compiler panel on right (collapsible)
4. Real-time syntax highlighting
5. Error squiggles with hover tooltips
6. Keyboard shortcuts for compile (Ctrl+Shift+B) and deploy (Ctrl+Shift+D)

### Deployment Workflow
```
User Clicks "Deploy" Button
  ↓
Modal Opens: "Deployment Configuration"
  - Network selection (if not locked)
  - Account selection (from wallet)
  - Gas price preview
  - Constructor params (if needed)
  ↓
User Reviews & Confirms
  ↓
"Connect Wallet" (if not already)
  - MetaMask popup or integrated prompt
  ↓
"Sign Transaction" 
  - Wallet prompts user to sign
  ↓
"Deploying..." (progress indicator)
  - Show transaction hash
  - Poll for confirmation
  ↓
"Deployment Successful!"
  - Display contract address (copyable)
  - Show block number and timestamp
  - Provide options: [Test Contract] [View on Explorer] [Copy Address]
  ↓
Automatically Switch to Testing Tab
```

### Testing Interface
```
Left Panel: Function List (from ABI)
  - Read Functions (blue)
  - Write Functions (orange/red)
  - Constructor (grayed out)

Center Panel: Function Details & Execution
  - Function name and description (if available)
  - Parameter inputs with validation
  - Execute button with gas estimate
  - Results panel below

Right Panel: Event Log
  - Real-time event emissions
  - Filterable by event type
  - Show indexed parameters
```

---

## Performance & Quality Requirements

### Performance Targets
- Initial load time: < 2 seconds
- Project opening: < 1 second
- Code editor responsiveness: < 16ms per keystroke
- Compilation feedback: < 500ms for small files
- Deployment confirmation check: Poll every 2 seconds

### Reliability
- Auto-save every 30 seconds (configurable)
- Project backup on disk
- Graceful error handling with recovery suggestions
- Offline mode for code editing (deployment disabled)
- Session recovery on crash

### Security
- Private keys never stored in frontend
- All deployment signed at wallet level
- CORS-compliant RPC communication
- Input sanitization for all user inputs
- No sensitive data in console logs
- Environment variable management for API keys

### Code Quality
- TypeScript strict mode enabled
- ESLint + Prettier configured
- Unit tests for critical paths (>80% coverage)
- E2E tests for deployment flow
- Automated accessibility audits (WCAG 2.1 AA)
- Performance profiling and monitoring

---

## Development Guidelines

### Code Standards
1. **Component Structure**: Small, focused, reusable components
2. **State Management**: Centralized store for IDE state, local state for UI components
3. **Styling**: CSS Modules for component styles, global CSS for theme
4. **Type Safety**: No `any` types; explicit TypeScript interfaces
5. **Error Handling**: Try-catch with proper error boundaries
6. **Logging**: Structured logging with severity levels

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Note: Primarily desktop-focused

### Build & Deployment
- Frontend: Vite for fast HMR during development
- Backend: Docker containerization (.NET application)
- CI/CD: GitHub Actions for automated testing and deployment
- Versioning: Semantic versioning (major.minor.patch)

---

## Documentation & Help

### In-App Documentation
- Hover tooltips on all buttons and controls
- "?" icon accessing context-sensitive help
- Keyboard shortcuts reference (Ctrl+K → Shift+?)
- Link to https://www.quorlin.dev for Quorlin documentation
- Link to https://docs.soliditylang.org for Solidity documentation

### External Resources
- GitHub repository with comprehensive README
- Getting Started guide with screenshots
- Troubleshooting section for common issues
- Video tutorials for common workflows
- Community Discord/Forum for support

---

## Success Criteria

✅ **Visual**: IDE is visually indistinguishable from professional standard (VS Code level)
✅ **Functional**: Seamless workflow from code → compile → deploy → test
✅ **Reliable**: Zero data loss; graceful error handling throughout
✅ **Performant**: Responsive interactions without lag or stuttering
✅ **Intuitive**: New users can create, compile, and deploy a contract in < 10 minutes
✅ **Professional**: Production-ready code quality and architecture
✅ **Scalable**: Support for multiple projects, languages, and future networks

---

## Integration Points

### Compiler Integration
- Solidity: Use native solc compiler or Hardhat compiler
- Quorlin: Integrate official Quorlin compiler from https://www.quorlin.dev

### Blockchain Integration
- RPC: https://poseidon-rpc.kortana.worcester.xyz/ (Testnet)
- Wallet: MetaMask, WalletConnect (Web3 standards)
- Contract Interaction: ethers.js or web3.js library

### Analytics (Optional)
- Track IDE usage patterns
- Monitor compilation success rates
- Deployment success/failure metrics
- User feedback collection

---

## Future Enhancements (Post-MVP)
- Mainnet RPC integration
- Advanced debugging with breakpoints
- Contract verification and etherscan integration
- Multi-signature deployment support
- Plugin ecosystem for extensions
- Collaborative editing (cloud-based projects)
- Built-in audit tool integration
- Gas optimization suggestions
- Contract interaction testing framework

---

## Summary
Kortana Studio will be a **drop-dead gorgeous**, **production-ready** IDE that rivals Remix and VS Code in both aesthetics and functionality. Every pixel must be intentional, every interaction must be smooth, and every error must be handled gracefully. The result should be an IDE that developers are proud to use and recommend to others.
