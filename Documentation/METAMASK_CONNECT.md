
# 🦊 Connecting Kortana to MetaMask

Kortana Blockchain is fully compatible with MetaMask!

Since you are running your own blockchain, you need to add it as a **"Custom Network"** in MetaMask.

## ⚙️ Connection Details

| Field | Value |
|-------|-------|
| **Network Name** | `Kortana Testnet` |
| **RPC URL** | `https://poseidon-rpc.kortana.worchsester.xyz` |
| **Chain ID** | `72511` |
| **Currency Symbol** | `DNR` |
| **Block Explorer** | (Leave empty or use `http://localhost:3000` if you built one) |

> **Note:** We are using Chain ID `72511` for our Testnet environment. This ensures no conflicts with other major networks.

## 📝 Step-by-Step Instructions

1.  **Open MetaMask** in your browser.
2.  Click the **Network Dropdown** (top left) and select **"Add network"**.
3.  Scroll down and click **"Add a network manually"**.
4.  **Fill in the details** from the table above:
    *   **Network Name:** `Kortana Testnet`
    *   **New RPC URL:** `https://poseidon-rpc.kortana.worchsester.xyz`
    *   **Chain ID:** `72511`
    *   **Currency Symbol:** `DNR`
5.  Click **Save**.

🎉 **Success!** You are now connected to your local Kortana Testnet.

## 🧪 How to Test

1.  **Import the Faucet Account:**
    *   To see funds immediately, import the private key of the Genesis "Faucet" account.
    *   **Private Key:** `2d502aa349bb96c3676db8fd9ceb611594ca2a6dfbeeb9f2b175bf9116cbcdaa`
    *   You should see a massive balance of **DNR**.

2.  **Send Tokens:**
    *   Create a second account in MetaMask ("Account 2").
    *   Send `50 DNR` from the Faucet Account to Account 2.
    *   Watch the transaction confirm instantly (every 5 seconds).
