# 🚀 Deploying Kortana IDE to Render.com

Your IDE is now configured for a high-performance deployment using **Docker**. This allows the Web version to perform real Solidity compilation on the server.

### 🛠️ Prerequisites
1. A [Render.com](https://render.com) account.
2. This repository pushed to GitHub/GitLab.

### 📦 Step-by-Step Deployment

1. **Create a New Web Service**:
   - Log in to your Render Dashboard.
   - Click **New +** and select **Web Service**.
   - Connect your GitHub repository.

2. **Configure Service Settings**:
   - **Name**: `kortana-ide` (or your choice).
   - **Environment**: Select **Docker**.
   - **Region**: Choose the one closest to you.
   - **Runtime**: Render will automatically pick up the `Dockerfile` in the root.

3. **Advanced Settings (Required)**:
   - Render defaults to port `10000`, but our Dockerfile is configured for `8080`.
   - Scroll down to **Environment Variables** and add:
     - `PORT` = `8080`
   - Render will now correctly route traffic to the container.

4. **Deploy!**:
   - Click **Create Web Service**.
   - Render will build the Frontend (Node), compile the Backend (.NET), and spin up the container.

---

### 🌟 Post-Deployment
- Once the status is "Live," open the URL provided by Render.
- **Install as App**: In your browser address bar, click the "Install" icon to get the native desktop experience.
- **Real Compilation**: The `solc` compiler is now running in your Render container, so your `SushiToken` will compile with 100% accuracy.

### 🍣 testing the SushiToken
- Open the deployed IDE.
- Paste your `SushiToken.sol` code.
- Click **Run & Compile** (it will now use the real `solc`).
- Click **Deploy Pulse** (connect your MetaMask to the Kortana Testnet).
- Use the **Interaction Panel** to see your real token name and symbol!
