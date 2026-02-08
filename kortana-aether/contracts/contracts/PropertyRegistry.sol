// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PropertyRegistry
 * @dev Immutable record of property metadata and ownership transfers.
 */
contract PropertyRegistry is Ownable {
    struct PropertyMetadata {
        uint256 id;
        string title;
        string location;
        string country;
        uint256 valuationUSD;
        address tokenAddress;
        string metadataURI;
        uint256 createdAt;
    }

    uint256 private _nextPropertyId = 1;
    mapping(uint256 => PropertyMetadata) public properties;
    mapping(address => uint256) public tokenToPropertyId;

    event PropertyRegistered(
        uint256 indexed propertyId,
        string title,
        address indexed tokenAddress
    );

    event OwnershipTransferRecorded(
        uint256 indexed propertyId,
        address indexed from,
        address indexed to,
        uint256 tokens,
        bytes32 txHash
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Register a new property on the platform.
     */
    function registerProperty(
        string memory title,
        string memory location,
        string memory country,
        uint256 valuationUSD,
        address tokenAddress,
        string memory metadataURI
    ) external onlyOwner returns (uint256 propertyId) {
        propertyId = _nextPropertyId++;

        properties[propertyId] = PropertyMetadata({
            id: propertyId,
            title: title,
            location: location,
            country: country,
            valuationUSD: valuationUSD,
            tokenAddress: tokenAddress,
            metadataURI: metadataURI,
            createdAt: block.timestamp
        });

        tokenToPropertyId[tokenAddress] = propertyId;

        emit PropertyRegistered(propertyId, title, tokenAddress);
        return propertyId;
    }

    /**
     * @dev Retrieve metadata for a property.
     */
    function getPropertyMetadata(
        uint256 propertyId
    ) external view returns (PropertyMetadata memory) {
        return properties[propertyId];
    }

    /**
     * @dev Record an ownership transfer (called by platform after successful escrow).
     */
    function recordOwnershipTransfer(
        uint256 propertyId,
        address from,
        address to,
        uint256 tokens,
        bytes32 txHash
    ) external onlyOwner {
        emit OwnershipTransferRecorded(propertyId, from, to, tokens, txHash);
    }

    /**
     * @dev Verification placeholder (could be expanded to check actual balances).
     */
    function verifyOwnership(
        uint256 propertyId,
        address user
    ) external view returns (uint256) {
        // This is a simplified view. Actual balance should be checked on the PropertyToken contract.
        return 0;
    }
}
