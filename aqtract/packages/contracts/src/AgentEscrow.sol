// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IAgentEscrow} from "./interfaces/IAgentEscrow.sol";

contract AgentEscrow is IAgentEscrow, Ownable2Step, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    uint16 public platformFeeBps;
    address public feeRecipient;

    mapping(bytes32 => EscrowRecord) private _escrows;
    mapping(bytes32 => uint256[]) private _milestoneAmounts;

    constructor(
        uint16 _platformFeeBps,
        address _feeRecipient
    ) Ownable(msg.sender) {
        require(_platformFeeBps <= 1000, "Fee too high");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        platformFeeBps = _platformFeeBps;
        feeRecipient = _feeRecipient;
    }

    function createEscrow(
        bytes32 escrowId,
        address provider,
        address token,
        uint256[] calldata milestoneAmounts,
        uint256 deadline
    ) external payable nonReentrant whenNotPaused {
        require(_escrows[escrowId].createdAt == 0, "Escrow exists");
        require(provider != address(0), "Invalid provider");
        require(provider != msg.sender, "Self-escrow");
        require(milestoneAmounts.length > 0, "No milestones");
        require(milestoneAmounts.length <= 20, "Too many milestones");
        require(deadline > block.timestamp, "Deadline passed");

        uint256 total = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            require(milestoneAmounts[i] > 0, "Zero milestone");
            total += milestoneAmounts[i];
        }

        if (token == address(0)) {
            require(msg.value == total, "Wrong ETH amount");
        } else {
            require(msg.value == 0, "ETH sent with token");
            IERC20(token).safeTransferFrom(msg.sender, address(this), total);
        }

        _escrows[escrowId] = EscrowRecord({
            requester: msg.sender,
            provider: provider,
            token: token,
            totalAmount: total,
            releasedAmount: 0,
            milestoneCount: uint8(milestoneAmounts.length),
            milestonesReleased: 0,
            status: EscrowStatus.Funded,
            deadline: deadline,
            createdAt: block.timestamp
        });

        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            _milestoneAmounts[escrowId].push(milestoneAmounts[i]);
        }

        emit EscrowCreated(
            escrowId,
            msg.sender,
            provider,
            token,
            total,
            uint8(milestoneAmounts.length)
        );
    }

    function releaseMilestone(
        bytes32 escrowId,
        uint8 milestoneIndex
    ) external nonReentrant whenNotPaused {
        EscrowRecord storage e = _escrows[escrowId];
        require(e.createdAt != 0, "Not found");
        require(msg.sender == e.requester, "Not requester");
        require(
            e.status == EscrowStatus.Funded || e.status == EscrowStatus.PartialRelease,
            "Wrong status"
        );
        require(milestoneIndex == e.milestonesReleased, "Wrong milestone order");

        uint256 amount = _milestoneAmounts[escrowId][milestoneIndex];
        uint256 fee = (amount * platformFeeBps) / 10000;
        uint256 payout = amount - fee;

        e.releasedAmount += amount;
        e.milestonesReleased++;

        if (e.milestonesReleased == e.milestoneCount) {
            e.status = EscrowStatus.Completed;
            emit EscrowCompleted(escrowId);
        } else {
            e.status = EscrowStatus.PartialRelease;
        }

        _transfer(e.token, e.provider, payout);
        if (fee > 0) {
            _transfer(e.token, feeRecipient, fee);
        }

        emit MilestoneReleased(escrowId, milestoneIndex, payout, fee);
    }

    function dispute(bytes32 escrowId) external whenNotPaused {
        EscrowRecord storage e = _escrows[escrowId];
        require(e.createdAt != 0, "Not found");
        require(
            msg.sender == e.requester || msg.sender == e.provider,
            "Not party"
        );
        require(
            e.status == EscrowStatus.Funded || e.status == EscrowStatus.PartialRelease,
            "Wrong status"
        );

        e.status = EscrowStatus.Disputed;
        emit DisputeOpened(escrowId, msg.sender);
    }

    function resolveDispute(
        bytes32 escrowId,
        uint256 toProvider,
        uint256 toRequester
    ) external nonReentrant onlyOwner {
        EscrowRecord storage e = _escrows[escrowId];
        require(e.createdAt != 0, "Not found");
        require(e.status == EscrowStatus.Disputed, "Not disputed");

        uint256 remaining = e.totalAmount - e.releasedAmount;
        require(toProvider + toRequester == remaining, "Amounts mismatch");

        e.releasedAmount = e.totalAmount;
        e.status = EscrowStatus.Completed;

        if (toProvider > 0) {
            uint256 fee = (toProvider * platformFeeBps) / 10000;
            _transfer(e.token, e.provider, toProvider - fee);
            if (fee > 0) _transfer(e.token, feeRecipient, fee);
        }
        if (toRequester > 0) {
            _transfer(e.token, e.requester, toRequester);
        }

        emit DisputeResolved(escrowId, toProvider, toRequester);
    }

    function refund(bytes32 escrowId) external nonReentrant {
        EscrowRecord storage e = _escrows[escrowId];
        require(e.createdAt != 0, "Not found");
        require(msg.sender == e.requester, "Not requester");
        require(
            e.status == EscrowStatus.Funded || e.status == EscrowStatus.PartialRelease,
            "Wrong status"
        );
        require(block.timestamp > e.deadline, "Deadline not passed");

        uint256 remaining = e.totalAmount - e.releasedAmount;
        e.releasedAmount = e.totalAmount;
        e.status = EscrowStatus.Refunded;

        _transfer(e.token, e.requester, remaining);
        emit EscrowRefunded(escrowId, remaining);
    }

    function getEscrow(bytes32 escrowId) external view returns (EscrowRecord memory) {
        require(_escrows[escrowId].createdAt != 0, "Not found");
        return _escrows[escrowId];
    }

    function getMilestoneAmount(bytes32 escrowId, uint8 index) external view returns (uint256) {
        require(index < _milestoneAmounts[escrowId].length, "Index OOB");
        return _milestoneAmounts[escrowId][index];
    }

    function setFee(uint16 _platformFeeBps) external onlyOwner {
        require(_platformFeeBps <= 1000, "Fee too high");
        platformFeeBps = _platformFeeBps;
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid");
        feeRecipient = _feeRecipient;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _transfer(address token, address to, uint256 amount) private {
        if (token == address(0)) {
            (bool ok,) = to.call{value: amount}("");
            require(ok, "ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }
}
