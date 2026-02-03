#!/usr/bin/env python3
"""
Send test tokens to a specific address using the Kortana RPC
"""

import requests
import json

# Configuration
RPC_URL = "https://poseidon-rpc.kortana.worchsester.xyz/"
RECIPIENT_ADDRESS = "0x28e514Ce1a0554B83f6d5EEEE11B07D0e294D9F9"
AMOUNT_DNR = 100  # Amount in DNR

def send_tokens():
    """Send tokens using eth_requestDNR method"""
    
    print("=" * 80)
    print("KORTANA FAUCET - Sending Test Tokens")
    print("=" * 80)
    print()
    
    print(f"RPC Endpoint: {RPC_URL}")
    print(f"Recipient: {RECIPIENT_ADDRESS}")
    print(f"Amount: {AMOUNT_DNR} DNR")
    print()
    
    # Prepare RPC request
    payload = {
        "jsonrpc": "2.0",
        "method": "eth_requestDNR",
        "params": [RECIPIENT_ADDRESS, str(AMOUNT_DNR)],
        "id": 1
    }
    
    print("Sending request to faucet...")
    
    try:
        response = requests.post(RPC_URL, json=payload, timeout=10)
        response.raise_for_status()
        
        result = response.json()
        
        if "result" in result and result["result"]:
            print()
            print("=" * 80)
            print("[SUCCESS] Tokens sent successfully!")
            print("=" * 80)
            print()
            print(f"[OK] {AMOUNT_DNR} DNR sent to {RECIPIENT_ADDRESS}")
            print()
            print("Next steps:")
            print("1. Open MetaMask")
            print("2. Check your Activity tab")
            print("3. You should see the incoming transaction!")
            print()
            print("Note: It may take 5-10 seconds for the transaction to appear")
            print("      as it needs to be included in a block.")
            print()
        else:
            print()
            print("[ERROR] Faucet request failed")
            print(f"Response: {result}")
            print()
            
    except requests.exceptions.RequestException as e:
        print()
        print(f"[ERROR] Network Error: {e}")
        print()
        print("Possible issues:")
        print("- RPC endpoint might be down")
        print("- Network connectivity issues")
        print("- Firewall blocking the request")
        print()
    except Exception as e:
        print()
        print(f"[ERROR] Unexpected Error: {e}")
        print()

if __name__ == "__main__":
    send_tokens()
