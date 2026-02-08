// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EscrowManager
 * @dev Handles property token purchases with multi-sig release and timeout refunds.
 * Dinar is assumed to be the native token of the Kortana blockchain.
 */
contract EscrowManager is Ownable, ReentrancyGuard {
    enum EscrowStatus {
        Initiated,
        Confirmed,
        Released,
        Refunded
    }

    struct Escrow {
        address buyer;
        address seller;
        address propertyToken;
        uint256 tokenAmount;
        uint256 dinarAmount;
        EscrowStatus status;
        uint256 createdAt;
        bool sellerConfirmed;
        bool adminConfirmed;
    }

    uint256 private _nextEscrowId = 1;
    mapping(uint256 => Escrow) public escrows;
    uint256 public constant TIMEOUT = 7 days;

    event EscrowInitiated(
        uint256 indexed escrowId,
        address buyer,
        address seller,
        uint256 tokenAmount,
        uint256 dinarAmount
    );
    event EscrowConfirmed(uint256 indexed escrowId, address confirmer);
    event EscrowReleased(uint256 indexed escrowId);
    event EscrowRefunded(uint256 indexed escrowId);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Initiate an escrow. Buyer sends Dinar, Seller (or platform) holds tokens.
     * Tokens are usually transferred to this contract for locking.
     */
    function initiateEscrow(
        address seller,
        address propertyToken,
        uint256 tokenAmount,
        uint256 dinarAmount
    ) external payable nonReentrant returns (uint256 escrowId) {
        require(msg.value == dinarAmount, "Incorrect Dinar amount sent");
        require(tokenAmount > 0, "Token amount must be greater than 0");

        // Transfer tokens from seller/platform to this contract
        IERC20(propertyToken).transferFrom(seller, address(this), tokenAmount);

        escrowId = _nextEscrowId++;
        escrows[escrowId] = Escrow({
            buyer: msg.sender,
            seller: seller,
            propertyToken: propertyToken,
            tokenAmount: tokenAmount,
            dinarAmount: dinarAmount,
            status: EscrowStatus.Initiated,
            createdAt: block.timestamp,
            sellerConfirmed: false,
            adminConfirmed: false
        });

        emit EscrowInitiated(
            escrowId,
            msg.sender,
            seller,
            tokenAmount,
            dinarAmount
        );
        return escrowId;
    }

    /**
     * @dev Confirm escrow by seller.
     */
    function confirmEscrowBySeller(uint256 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.seller, "Only seller can confirm");
        require(
            escrow.status == EscrowStatus.Initiated,
            "Invalid escrow status"
        );

        escrow.sellerConfirmed = true;
        emit EscrowConfirmed(escrowId, msg.sender);

        if (escrow.sellerConfirmed && escrow.adminConfirmed) {
            _release(escrowId);
        }
    }

    /**
     * @dev Confirm escrow by admin.
     */
    function confirmEscrowByAdmin(uint256 escrowId) external onlyOwner {
        Escrow storage escrow = escrows[escrowId];
        require(
            escrow.status == EscrowStatus.Initiated,
            "Invalid escrow status"
        );

        escrow.adminConfirmed = true;
        emit EscrowConfirmed(escrowId, msg.sender);

        if (escrow.sellerConfirmed && escrow.adminConfirmed) {
            _release(escrowId);
        }
    }

    /**
     * @dev Internal release function.
     */
    function _release(uint256 escrowId) internal {
        Escrow storage escrow = escrows[escrowId];
        escrow.status = EscrowStatus.Released;

        // Transfer Dinar to seller
        (bool success, ) = payable(escrow.seller).call{
            value: escrow.dinarAmount
        }("");
        require(success, "Dinar transfer failed");

        // Transfer Tokens to buyer
        IERC20(escrow.propertyToken).transfer(escrow.buyer, escrow.tokenAmount);

        emit EscrowReleased(escrowId);
    }

    /**
     * @dev Manual release by admin in case of issues.
     */
    function releaseEscrow(uint256 escrowId) external onlyOwner {
        Escrow storage escrow = escrows[escrowId];
        require(
            escrow.status == EscrowStatus.Initiated,
            "Invalid escrow status"
        );
        _release(escrowId);
    }

    /**
     * @dev Refund escrow if timeout reached or admin decides.
     */
    function refundEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(
            escrow.status == EscrowStatus.Initiated,
            "Invalid escrow status"
        );
        require(
            block.timestamp > escrow.createdAt + TIMEOUT ||
                msg.sender == owner(),
            "Timeout not reached or not admin"
        );

        escrow.status = EscrowStatus.Refunded;

        // Return Dinar to buyer
        (bool success, ) = payable(escrow.buyer).call{
            value: escrow.dinarAmount
        }("");
        require(success, "Dinar refund failed");

        // Return Tokens to seller
        IERC20(escrow.propertyToken).transfer(
            escrow.seller,
            escrow.tokenAmount
        );

        emit EscrowRefunded(escrowId);
    }

    function getEscrowStatus(
        uint256 escrowId
    ) external view returns (EscrowStatus) {
        return escrows[escrowId].status;
    }
}
