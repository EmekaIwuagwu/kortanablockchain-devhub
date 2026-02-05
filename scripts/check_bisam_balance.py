from web3 import Web3
import json

w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
contract_address = '0x350ef3784ec5fa5437ec3d67b57057ba6b9b0e86'
deployer = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
recipient = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

abi = [
    {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}
]

token = w3.eth.contract(address=contract_address, abi=abi)

print(f"Checking Token at {contract_address}")
print(f"Symbol: {token.functions.symbol().call()}")
print(f"Deployer ({deployer}) Balance: {token.functions.balanceOf(deployer).call()}")
print(f"Recipient ({recipient}) Balance: {token.functions.balanceOf(recipient).call()}")
