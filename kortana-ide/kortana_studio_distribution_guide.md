# Kortana Studio - Distribution & Deployment Guide

## Table of Contents
1. [Multi-Platform Release Strategy](#multi-platform-release-strategy)
2. [Desktop Application Distribution](#desktop-application-distribution)
3. [Web IDE Deployment](#web-ide-deployment)
4. [Development Environment Setup](#development-environment-setup)
5. [Building & Packaging](#building--packaging)
6. [Testing Across Platforms](#testing-across-platforms)
7. [Release Management](#release-management)

---

## Multi-Platform Release Strategy

### Version Numbering
Use semantic versioning: `MAJOR.MINOR.PATCH`
- **Major**: Breaking changes or major features
- **Minor**: Backward-compatible features
- **Patch**: Bug fixes and security patches

Example: `v1.5.3` - Stable version 1, 5 minor features, 3 patches

### Release Cadence
- **Stable Releases**: Every 2-4 weeks (Desktop + Web synchronized)
- **Patch Releases**: As needed for security or critical bugs
- **Beta/RC**: Optional pre-release testing period

### Distribution Channels
```
Stable (Default)
├─ Windows: GitHub Releases, MSIX package store
├─ macOS: GitHub Releases, Mac App Store (future)
├─ Linux: GitHub Releases, Flathub, Snapcraft
└─ Web: Auto-deployed to studio.kortana.io

Beta (Opt-in)
├─ Desktop: Opt-in auto-updater channel
└─ Web: staging.studio.kortana.io

Nightly (Development)
├─ Desktop: Manual download from CI/CD
└─ Web: dev.studio.kortana.io
```

---

## Desktop Application Distribution

### Windows (.exe Installer)

#### Build Configuration (electron-builder):
```json
// electron-builder.json
{
  "appId": "io.kortana.studio",
  "productName": "Kortana Studio",
  "directories": {
    "output": "dist",
    "buildResources": "assets"
  },
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64"]
      },
      {
        "target": "msi",
        "arch": ["x64"]
      },
      {
        "target": "portable",
        "arch": ["x64"]
      }
    ],
    "certificateFile": "path/to/certificate.pfx",
    "certificatePassword": "${env.WIN_CSC_KEY_PASSWORD}",
    "signingHashAlgorithms": ["sha256"],
    "sign": "./customSign.js"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "Kortana Studio"
  }
}
```

#### Installation Path:
```
Default: C:\Users\{username}\AppData\Local\Programs\Kortana Studio\
Custom: User-selected directory
```

#### Registry Entries (Windows):
```
HKEY_LOCAL_MACHINE\SOFTWARE\Kortana Studio
  InstallLocation: C:\Users\{user}\AppData\Local\Programs\Kortana Studio
  
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\KortanaStudio.exe
  (Default): C:\Users\{user}\AppData\Local\Programs\Kortana Studio\Kortana Studio.exe
  
HKEY_CURRENT_USER\Software\Classes\.sol
  (Default): KortanaStudio.SolidityFile
  
HKEY_CURRENT_USER\Software\Classes\KortanaStudio.SolidityFile\shell\open\command
  (Default): "C:\Users\{user}\AppData\Local\Programs\Kortana Studio\Kortana Studio.exe" "%1"
```

#### NSIS Installer Script:
```nsis
; installer.nsi
!include "MUI2.nsh"

Name "Kortana Studio"
OutFile "KortanaStudio-Setup-1.0.0.exe"
InstallDir "$PROGRAMFILES64\Kortana Studio"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath "$INSTDIR"
  File "dist\KortanaStudio.exe"
  File "dist\*.dll"
  
  CreateDirectory "$SMPROGRAMS\Kortana Studio"
  CreateShortCut "$SMPROGRAMS\Kortana Studio\Kortana Studio.lnk" "$INSTDIR\KortanaStudio.exe"
  CreateShortCut "$DESKTOP\Kortana Studio.lnk" "$INSTDIR\KortanaStudio.exe"
  
  WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd
```

#### Auto-Update Configuration:
```json
// update-config.json
{
  "owner": "kortana-io",
  "repo": "kortana-studio",
  "releaseType": "release",
  "provider": "github"
}
```

#### Update Flow:
```
1. Check for updates (24h interval)
   GET https://api.github.com/repos/kortana-io/kortana-studio/releases/latest
   
2. Compare versions
   Current: v1.0.0
   Latest: v1.0.1
   
3. Download delta update (or full package)
   https://github.com/kortana-io/kortana-studio/releases/download/v1.0.1/
   
4. Verify digital signature
   SHA256: abc123...
   
5. Stage update in AppData
   %LOCALAPPDATA%\KortanaStudio\Update\
   
6. Install on next app launch
   Run installer with --update flag
   
7. Relaunch application
```

---

### macOS (.dmg package)

#### Build Configuration:
```json
// electron-builder.json (macOS section)
{
  "mac": {
    "target": [
      "dmg",
      "zip"
    ],
    "category": "public.app-category.developer-tools",
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.plist",
    "gatekeeperAssess": false,
    "hardenedRuntime": true,
    "certificateFile": "build/cert.p12",
    "certificatePassword": "${env.MAC_CSC_KEY_PASSWORD}",
    "signingIdentity": "Developer ID Application"
  },
  "dmg": {
    "contents": [
      {
        "x": 110,
        "y": 150,
        "type": "file",
        "path": "build/Kortana Studio.app"
      },
      {
        "x": 240,
        "y": 150,
        "type": "link",
        "path": "/Applications"
      }
    ],
    "window": {
      "width": 400,
      "height": 300
    }
  }
}
```

#### Entitlements (Security):
```xml
<!-- build/entitlements.mac.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.files.user-selected.read-write</key>
  <true/>
  <key>com.apple.security.network.client</key>
  <true/>
  <key>com.apple.security.network.server</key>
  <true/>
</dict>
</plist>
```

#### Code Signing & Notarization:
```bash
# Sign application
codesign --deep --force --verify --verbose --sign "Developer ID Application" \
  /path/to/Kortana Studio.app

# Create DMG
hdiutil create -volname "Kortana Studio" -srcfolder /path/to/Kortana\ Studio.app \
  -ov -format UDZO KortanaStudio-1.0.0.dmg

# Notarize for Gatekeeper
xcrun altool --notarize-file KortanaStudio-1.0.0.dmg \
  --file KortanaStudio-1.0.0.dmg \
  --primary-bundle-id io.kortana.studio

# Staple notarization
xcrun altool --staple-file KortanaStudio-1.0.0.dmg
```

#### Installation:
```
1. User downloads KortanaStudio-1.0.0.dmg
2. macOS verifies notarization (Gatekeeper)
3. User opens DMG (mounts as virtual drive)
4. User drags "Kortana Studio.app" to Applications folder
5. macOS code-signs during copy
6. User runs from Applications (or Spotlight)
```

#### System Requirements Check:
```swift
// Swift code in app startup
import Foundation
import os

func checkMacOSVersion() {
  let version = ProcessInfo.processInfo.operatingSystemVersion
  let requiredVersion = OperatingSystemVersion(majorVersion: 11, minorVersion: 0, patchVersion: 0)
  
  if version < requiredVersion {
    let alert = NSAlert()
    alert.messageText = "Incompatible macOS Version"
    alert.informativeText = "Kortana Studio requires macOS 11.0 or later"
    alert.runModal()
    NSApp.terminate(nil)
  }
}
```

---

### Linux (.AppImage and .deb)

#### Build Configuration (electron-builder):
```json
// electron-builder.json (Linux section)
{
  "linux": {
    "target": [
      "AppImage",
      "deb"
    ],
    "category": "Development",
    "desktop": {
      "StartupNotify": true,
      "Terminal": false
    }
  },
  "appImage": {
    "artifactName": "KortanaStudio-${version}-${arch}.AppImage"
  },
  "deb": {
    "depends": [
      "gconf2",
      "gconf-service",
      "libappindicator1",
      "libnotify4",
      "libxss1",
      "libxtst6"
    ],
    "afterInstall": "./build/after-install.sh",
    "afterRemove": "./build/after-remove.sh"
  }
}
```

#### AppImage Format:
```bash
# AppImage is a self-contained executable
# Structure:
# ./KortanaStudio-1.0.0-x86_64.AppImage
#   ├── AppRun (execution script)
#   ├── AppDir/
#   │   ├── usr/
#   │   │   ├── bin/
#   │   │   ├── lib/
#   │   │   └── share/
#   │   └── kortana-studio.desktop
#   └── (squashfs filesystem)

# Usage:
chmod +x KortanaStudio-1.0.0-x86_64.AppImage
./KortanaStudio-1.0.0-x86_64.AppImage

# Optional: Install to system
sudo mv KortanaStudio-1.0.0-x86_64.AppImage /opt/KortanaStudio
sudo ln -s /opt/KortanaStudio /usr/local/bin/kortana-studio
```

#### Debian Package (.deb):
```bash
# Install on Ubuntu/Debian
sudo apt install ./KortanaStudio_1.0.0_amd64.deb

# Or using snap
sudo snap install kortana-studio

# Or using Flathub
flatpak install flathub io.kortana.studio
```

#### Desktop Entry File:
```ini
# build/KortanaStudio.desktop
[Desktop Entry]
Name=Kortana Studio
Exec=kortana-studio %U
Icon=kortana-studio
Type=Application
Categories=Development;
Keywords=blockchain;solidity;quorlin;
MimeType=text/x-solidity;text/x-quorlin;
Comment=Blockchain IDE for Kortana
StartupNotify=true
```

#### Post-Install Script:
```bash
#!/bin/bash
# build/after-install.sh

# Update mimedb for .sol and .qrl file associations
update-mime-database /usr/share/mime 2>/dev/null || true

# Update desktop database
update-desktop-database /usr/share/applications 2>/dev/null || true

# Update icon cache
gtk-update-icon-cache -f -t /usr/share/icons/hicolor 2>/dev/null || true
```

---

## Web IDE Deployment

### Docker Container Build

#### Dockerfile:
```dockerfile
# Multi-stage build for optimized image

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /build/frontend

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
# Output: /build/frontend/dist

# Stage 2: Build backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-builder
WORKDIR /build/backend

COPY backend/KortanaStudio.Backend.csproj .
RUN dotnet restore

COPY backend/ .
RUN dotnet publish -c Release -o /app/backend

# Stage 3: Runtime environment
FROM node:18-alpine
WORKDIR /app

# Install .NET runtime
RUN apk add --no-cache aspnetcore-runtime-8.0

# Copy frontend build
COPY --from=frontend-builder /build/frontend/dist /app/public

# Copy backend build
COPY --from=backend-builder /app/backend /app/backend

# Copy scripts
COPY docker/start.sh /app/
RUN chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Environment variables (override with secrets in production)
ENV NODE_ENV=production
ENV ASPNETCORE_ENVIRONMENT=Production
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT ["/app/start.sh"]
```

#### Docker Compose (Local Development):
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:5000
      VITE_WS_URL: ws://localhost:5000
    volumes:
      - ./src:/app/src
    command: npm run dev

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      ASPNETCORE_URLS: http://+:5000
      DATABASE_URL: postgresql://user:password@postgres:5432/kortana
      REDIS_URL: redis://redis:6379
      AWS_S3_BUCKET: kortana-studio-dev
      RPC_TESTNET_URL: https://poseidon-rpc.kortana.worcester.xyz/
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: kortana
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes Deployment

#### Deployment Manifest:
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kortana-studio
  labels:
    app: kortana-studio
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: kortana-studio
  template:
    metadata:
      labels:
        app: kortana-studio
    spec:
      containers:
      - name: kortana-studio
        image: kortana/studio:v1.0.0
        imagePullPolicy: IfNotPresent
        ports:
        - name: http
          containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: kortana-studio-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: kortana-studio-secrets
              key: redis-url
        - name: AWS_ACCESS_KEY_ID
          valueFrom:
            secretKeyRef:
              name: kortana-studio-secrets
              key: aws-access-key
        - name: AWS_SECRET_ACCESS_KEY
          valueFrom:
            secretKeyRef:
              name: kortana-studio-secrets
              key: aws-secret-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Service:
```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: kortana-studio-service
spec:
  type: LoadBalancer
  selector:
    app: kortana-studio
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
    name: http
  - protocol: TCP
    port: 443
    targetPort: 3000
    name: https
```

#### Ingress (HTTPS with Let's Encrypt):
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kortana-studio-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - studio.kortana.io
    secretName: kortana-studio-tls
  rules:
  - host: studio.kortana.io
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: kortana-studio-service
            port:
              number: 80
```

### Horizontal Pod Autoscaler:
```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: kortana-studio-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: kortana-studio
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## Development Environment Setup

### Prerequisites (All Platforms)

```bash
# Node.js 18+ LTS
node --version  # v18.17.0 or later

# npm 9+
npm --version   # 9.6.7 or later

# Git
git --version   # 2.40.0 or later

# .NET 8 SDK (for backend)
dotnet --version  # 8.0 or later
```

### Desktop Development Setup

#### Clone Repository:
```bash
git clone https://github.com/kortana-io/kortana-studio.git
cd kortana-studio
```

#### Install Dependencies:
```bash
# Frontend
npm install

# Backend (.NET)
cd backend
dotnet restore
cd ..
```

#### Development Server (Desktop):
```bash
# Terminal 1: Start backend service
cd backend
dotnet run --configuration Debug

# Terminal 2: Start Electron dev server
npm run dev:desktop

# Electron window opens with hot reload
```

#### Build Desktop Installer (Local):
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux

# All platforms
npm run build
```

### Web IDE Development Setup

#### Install Dependencies:
```bash
npm install
npm install -g @nestjs/cli  # For backend scaffolding (optional)
```

#### Development Server (Web):
```bash
# Terminal 1: Backend API
npm run dev:api

# Terminal 2: Frontend
npm run dev:web

# Terminal 3: Database migrations (optional)
npm run db:migrate

# Frontend available at http://localhost:3000
# API available at http://localhost:5000
```

#### Environment Variables (.env.local):
```env
# Frontend
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/kortana_dev
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=kortana-studio-dev
JWT_SECRET=your_jwt_secret
RPC_TESTNET_URL=https://poseidon-rpc.kortana.worcester.xyz/
```

---

## Building & Packaging

### Release Build Steps

#### 1. Prepare Release:
```bash
# Update version in package.json
npm version patch  # or minor, major

# Update CHANGELOG
vim CHANGELOG.md

# Commit and tag
git add .
git commit -m "chore: release v1.0.1"
git tag v1.0.1
git push origin main --tags
```

#### 2. Build All Artifacts:
```bash
# Clean previous builds
rm -rf dist

# Build desktop applications
npm run build

# Build web docker image
docker build -t kortana/studio:v1.0.1 .

# Verify builds
ls -la dist/  # Windows, macOS, Linux installers
docker images | grep kortana/studio
```

#### 3. Create GitHub Release:
```bash
# Using GitHub CLI
gh release create v1.0.1 \
  --title "Kortana Studio v1.0.1" \
  --notes-file RELEASE_NOTES.md \
  dist/*.exe \
  dist/*.dmg \
  dist/*.AppImage \
  dist/*.deb
```

#### 4. Push Docker Image:
```bash
docker login
docker push kortana/studio:v1.0.1
docker tag kortana/studio:v1.0.1 kortana/studio:latest
docker push kortana/studio:latest
```

#### 5. Deploy Web:
```bash
# Update Kubernetes manifests
sed -i 's/v[0-9]*\.[0-9]*\.[0-9]*/v1.0.1/g' k8s/deployment.yaml

# Apply changes
kubectl apply -f k8s/

# Verify rollout
kubectl rollout status deployment/kortana-studio
```

---

## Testing Across Platforms

### Unit & Integration Tests:
```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### E2E Tests (Playwright):
```bash
# Install Playwright browsers
npx playwright install

# Run tests
npm run test:e2e

# Headed mode (see browser)
npm run test:e2e -- --headed

# Test specific file
npx playwright test tests/deployment.spec.ts
```

### Desktop App Testing:
```bash
# Test on Windows
npm run test:win

# Test on macOS
npm run test:mac

# Test on Linux
npm run test:linux
```

### Performance Testing:
```bash
# Lighthouse CI
npm run test:lighthouse

# Load testing
npm run test:load  # Uses k6 or Artillery
```

---

## Release Management

### Semantic Versioning Examples:
- `v1.0.0` → Initial release
- `v1.1.0` → Add new feature (Quorlin support)
- `v1.1.1` → Fix critical bug in compiler
- `v2.0.0` → Major redesign or breaking changes

### Support Policy:
- **Active**: Latest major version
- **Extended**: Previous major version (critical fixes only)
- **Deprecated**: Older versions (no updates)

### Bug Fix Backport:
```bash
# Fix bug on main branch
git checkout main
git fix some-bug
git commit -m "fix: resolve compiler issue"

# Cherry-pick to support branch
git checkout support/v1.1.x
git cherry-pick <commit-hash>
git push origin support/v1.1.x
```

