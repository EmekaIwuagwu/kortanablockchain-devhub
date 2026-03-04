// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KortanaBridge
 * @dev Handles locking of assets on the source chain.
 */
contract KortanaBridge is Ownable {
    event PulseInitiated(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 targetChainId,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Bridge native DNR tokens.
     */
    function bridgeNative(uint256 targetChainId) external payable {
        require(msg.value > 0, "Amount must be > 0");

        emit PulseInitiated(
            msg.sender,
            address(0), // address(0) represents native DNR
            msg.value,
            targetChainId,
            block.timestamp
        );
    }

    /**
     * @dev Bridge ERC-20 tokens.
     */
    function bridgeToken(
        address token,
        uint256 amount,
        uint256 targetChainId
    ) external {
        require(amount > 0, "Amount must be > 0");

        IERC20(token).transferFrom(msg.sender, address(this), amount);

        emit PulseInitiated(
            msg.sender,
            token,
            amount,
            targetChainId,
            block.timestamp
        );
    }

    /**
     * @dev Withdraw tokens/native if needed (admin/emergency).
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }
}
