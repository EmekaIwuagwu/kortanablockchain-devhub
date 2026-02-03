from eth_hash.auto import keccak
import hexbytes

def calculate_kortana_address(evm_addr_hex):
    # Remove 0x prefix
    if evm_addr_hex.startswith('0x'):
        evm_addr_hex = evm_addr_hex[2:]
    
    evm_bytes = bytes.fromhex(evm_addr_hex)
    
    # Calculate Keccak256 checksum (first 4 bytes)
    checksum_full = keccak(evm_bytes)
    checksum = checksum_full[:4]
    
    # Full 24-byte address
    kortana_bytes = evm_bytes + checksum
    return f"kn:0x{kortana_bytes.hex()}"

if __name__ == "__main__":
    faucet_evm = "450abFDa8fC66fCD1F98F7108bfA71cA33832273"
    print(calculate_kortana_address(faucet_evm))
