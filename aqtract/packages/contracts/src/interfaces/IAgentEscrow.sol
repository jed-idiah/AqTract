// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IAgentEscrow {
    enum EscrowStatus {
        Funded,
        PartialRelease,
        Disputed,
        Refunded,
        Completed,
        Expired
    }

    struct EscrowRecord {
        address requester;
        address provider;
        address token;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint8 milestoneCount;
        uint8 milestonesReleased;
        EscrowStatus status;
        uint256 deadline;
        uint256 createdAt;
    }

    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed requester,
        address indexed provider,
        address token,
        uint256 totalAmount,
        uint8 milestoneCount
    );
    event MilestoneReleased(
        bytes32 indexed escrowId,
        uint8 milestoneIndex,
        uint256 amount,
        uint256 fee
    );
    event DisputeOpened(bytes32 indexed escrowId, address initiator);
    event DisputeResolved(
        bytes32 indexed escrowId,
        uint256 toProvider,
        uint256 toRequester
    );
    event EscrowRefunded(bytes32 indexed escrowId, uint256 amount);
    event EscrowCompleted(bytes32 indexed escrowId);

    function createEscrow(
        bytes32 escrowId,
        address provider,
        address token,
        uint256[] calldata milestoneAmounts,
        uint256 deadline
    ) external payable;

    function releaseMilestone(bytes32 escrowId, uint8 milestoneIndex) external;
    function dispute(bytes32 escrowId) external;
    function resolveDispute(
        bytes32 escrowId,
        uint256 toProvider,
        uint256 toRequester
    ) external;
    function refund(bytes32 escrowId) external;
    function getEscrow(bytes32 escrowId) external view returns (EscrowRecord memory);
    function getMilestoneAmount(bytes32 escrowId, uint8 index) external view returns (uint256);
}
