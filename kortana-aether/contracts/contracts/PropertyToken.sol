// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PropertyToken
 * @dev ERC20 token representing fractional ownership of a real estate property.
 */
contract PropertyToken is ERC20, ERC20Pausable, Ownable {
    string public propertyLocation;
    uint256 public propertyValuationUSD;
    string public metadataURI;

    /**
     * @dev Constructor for PropertyToken.
     * @param name Name of the token (e.g., "Aether Property #1").
     * @param symbol Symbol for the token (e.g., "AEP1").
     * @param totalSupply Total supply of tokens (fractional units).
     * @param owner The address that will hold the initial supply.
     * @param _location Physical location of the property.
     * @param _valuation Initial valuation of the property in USD.
     * @param _metadataURI Link to the property metadata/documents.
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address owner,
        string memory _location,
        uint256 _valuation,
        string memory _metadataURI
    ) ERC20(name, symbol) Ownable(msg.sender) {
        propertyLocation = _location;
        propertyValuationUSD = _valuation;
        metadataURI = _metadataURI;
        _mint(owner, totalSupply);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // Override required by Solidity for multiple inheritance
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }

    /**
     * @dev Update metadata URI for the property.
     * @param newURI The new metadata URI.
     */
    function updateMetadataURI(string memory newURI) external onlyOwner {
        metadataURI = newURI;
    }

    /**
     * @dev Update property valuation.
     * @param newValuation The new valuation in USD.
     */
    function updateValuation(uint256 newValuation) external onlyOwner {
        propertyValuationUSD = newValuation;
    }
}
