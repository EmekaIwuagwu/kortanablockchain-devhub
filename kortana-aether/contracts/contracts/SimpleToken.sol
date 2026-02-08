// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleToken {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        address _owner,
        string memory _location,
        uint256 _valuation,
        string memory _metadataURI
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply;
        balanceOf[_owner] = _totalSupply;
        emit Transfer(address(0), _owner, _totalSupply);
    }

    function transfer(address to, uint256 value) public returns (bool success) {
        require(balanceOf[msg.sender] >= value);
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(
        address spender,
        uint256 value
    ) public returns (bool success) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public returns (bool success) {
        require(value <= balanceOf[from]);
        require(value <= allowance[from][msg.sender]);
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        emit Transfer(from, to, value);
        return true;
    }
}
