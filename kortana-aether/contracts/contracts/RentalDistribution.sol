// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RentalDistribution
 * @dev Automatically distribute rental income to property token holders.
 */
contract RentalDistribution is Ownable, ReentrancyGuard {
    struct Payout {
        uint256 amount;
        uint256 timestamp;
        uint256 totalTokensAtPayout;
    }

    // propertyToken => Payouts
    mapping(address => Payout[]) public propertyPayouts;
    // propertyToken => user => lastPayoutClaimedIndex
    mapping(address => mapping(address => uint256)) public userLastPayoutIndex;

    event RentalIncomeDeposited(address indexed propertyToken, uint256 amount);
    event PayoutClaimed(
        address indexed propertyToken,
        address indexed holder,
        uint256 amount
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Deposit rental income for a specific property.
     * The income is sent in Dinar (native token).
     */
    function depositRentalIncome(
        address propertyToken
    ) external payable onlyOwner {
        require(msg.value > 0, "Amount must be greater than 0");
        uint256 totalSupply = IERC20(propertyToken).totalSupply();
        require(totalSupply > 0, "No tokens minted for this property");

        propertyPayouts[propertyToken].push(
            Payout({
                amount: msg.value,
                timestamp: block.timestamp,
                totalTokensAtPayout: totalSupply
            })
        );

        emit RentalIncomeDeposited(propertyToken, msg.value);
    }

    /**
     * @dev Calculate total unclaimed share for a holder.
     */
    function calculateShare(
        address propertyToken,
        address holder
    ) public view returns (uint256) {
        uint256 totalShare = 0;
        uint256 lastIndex = userLastPayoutIndex[propertyToken][holder];
        Payout[] storage payouts = propertyPayouts[propertyToken];

        uint256 holderBalance = IERC20(propertyToken).balanceOf(holder);
        if (holderBalance == 0) return 0;

        for (uint256 i = lastIndex; i < payouts.length; i++) {
            // Note: This logic assumes holder's balance hasn't changed between payouts.
            // In a production system, we'd use a snapshotting ERC20 or a more complex algorithm.
            totalShare +=
                (payouts[i].amount * holderBalance) /
                payouts[i].totalTokensAtPayout;
        }

        return totalShare;
    }

    /**
     * @dev Claim all pending payouts for a property.
     */
    function claimPayout(address propertyToken) external nonReentrant {
        uint256 amount = calculateShare(propertyToken, msg.sender);
        require(amount > 0, "No payout available");

        userLastPayoutIndex[propertyToken][msg.sender] = propertyPayouts[
            propertyToken
        ].length;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Payout transfer failed");

        emit PayoutClaimed(propertyToken, msg.sender, amount);
    }

    /**
     * @dev Admin can manually distribute to a list of holders to save them from claiming.
     */
    function batchDistribute(
        address propertyToken,
        address[] calldata holders
    ) external onlyOwner nonReentrant {
        for (uint256 i = 0; i < holders.length; i++) {
            address holder = holders[i];
            uint256 amount = calculateShare(propertyToken, holder);
            if (amount > 0) {
                userLastPayoutIndex[propertyToken][holder] = propertyPayouts[
                    propertyToken
                ].length;
                (bool success, ) = payable(holder).call{value: amount}("");
                require(success, "Batch payout failed");
                emit PayoutClaimed(propertyToken, holder, amount);
            }
        }
    }
}
