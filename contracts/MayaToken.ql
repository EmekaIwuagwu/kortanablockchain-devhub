from quorlin.std import event, require, address, u128

contract MayaToken:
    """
    Maya Token (MAYA)
    An optimized Quorlin smart contract for the Kortana Blockchain.
    """
    
    # State variables
    _balances: map[address, u128]
    _total_supply: u128
    _name: str
    _symbol: str
    _decimals: u8

    def __init__(initial_supply: u128):
        self._name = "Maya Token"
        self._symbol = "MAYA"
        self._decimals = 18
        self._total_supply = initial_supply
        
        # self.sender is the contract deployer in Quorlin
        self._balances[self.sender] = initial_supply
        
        event.emit("Mint", self.sender, initial_supply)

    @public
    def transfer(recipient: address, amount: u128) -> bool:
        require(self._balances[self.sender] >= amount, "Insufficient Maya balance")
        
        self._balances[self.sender] -= amount
        self._balances[recipient] += amount
        
        event.emit("Transfer", self.sender, recipient, amount)
        return True

    @view
    def balance_of(owner: address) -> u128:
        return self._balances[owner]

    @view
    def total_supply() -> u128:
        return self._total_supply
