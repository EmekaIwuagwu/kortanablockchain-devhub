from eth_hash.auto import keccak
import hexbytes

def get_foundation_address():
    # Keccak256 hash of "foundation"
    pubkey = b"foundation"
    result = keccak(pubkey)
    
    # First 20 bytes is the EVM-compatible address
    evm_addr_bytes = result[0:20]
    evm_addr_hex = "0x" + evm_addr_bytes.hex()
    
    print(f"Foundation Pubkey: {pubkey.decode()}")
    print(f"EVM Address: {evm_addr_hex}")
    
    # Calculate Kortana checksum (first 4 bytes of keccak(evm_addr))
    # Actually wait, the from_pubkey uses calculate_checksum on addr_bytes[0..20]
    checksum_full = keccak(evm_addr_bytes)
    checksum = checksum_full[:4]
    
    full_addr = evm_addr_bytes + checksum
    print(f"Full Kortana Address: 0x{full_addr.hex()}")

if __name__ == "__main__":
    get_foundation_address()
