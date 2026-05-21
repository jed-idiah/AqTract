// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test, console} from "forge-std/Test.sol";
import {AgentEscrow} from "../src/AgentEscrow.sol";
import {IAgentEscrow} from "../src/interfaces/IAgentEscrow.sol";

contract AgentEscrowTest is Test {
    AgentEscrow public escrow;
    address public owner = address(this);
    address public feeRecipient = makeAddr("feeRecipient");
    address public requester = makeAddr("requester");
    address public provider = makeAddr("provider");

    uint16 constant FEE_BPS = 500; // 5%

    function setUp() public {
        escrow = new AgentEscrow(FEE_BPS, feeRecipient);
        vm.deal(requester, 100 ether);
        vm.deal(provider, 1 ether);
    }

    function _createSimpleEscrow(bytes32 id, uint256 amount) internal {
        uint256[] memory milestones = new uint256[](1);
        milestones[0] = amount;
        vm.prank(requester);
        escrow.createEscrow{value: amount}(
            id, provider, address(0), milestones, block.timestamp + 1 days
        );
    }

    function test_createEscrow() public {
        bytes32 id = keccak256("test1");
        _createSimpleEscrow(id, 1 ether);

        IAgentEscrow.EscrowRecord memory e = escrow.getEscrow(id);
        assertEq(e.requester, requester);
        assertEq(e.provider, provider);
        assertEq(e.totalAmount, 1 ether);
        assertEq(e.releasedAmount, 0);
        assertEq(e.milestoneCount, 1);
        assertEq(uint8(e.status), uint8(IAgentEscrow.EscrowStatus.Funded));
    }

    function test_createEscrow_multiMilestone() public {
        bytes32 id = keccak256("multi");
        uint256[] memory milestones = new uint256[](3);
        milestones[0] = 1 ether;
        milestones[1] = 2 ether;
        milestones[2] = 0.5 ether;

        vm.prank(requester);
        escrow.createEscrow{value: 3.5 ether}(
            id, provider, address(0), milestones, block.timestamp + 1 days
        );

        IAgentEscrow.EscrowRecord memory e = escrow.getEscrow(id);
        assertEq(e.milestoneCount, 3);
        assertEq(e.totalAmount, 3.5 ether);
        assertEq(escrow.getMilestoneAmount(id, 0), 1 ether);
        assertEq(escrow.getMilestoneAmount(id, 1), 2 ether);
        assertEq(escrow.getMilestoneAmount(id, 2), 0.5 ether);
    }

    function test_releaseMilestone() public {
        bytes32 id = keccak256("release");
        _createSimpleEscrow(id, 1 ether);

        uint256 providerBefore = provider.balance;
        uint256 feeBefore = feeRecipient.balance;

        vm.prank(requester);
        escrow.releaseMilestone(id, 0);

        uint256 expectedFee = (1 ether * uint256(FEE_BPS)) / 10000;
        uint256 expectedPayout = 1 ether - expectedFee;

        assertEq(provider.balance - providerBefore, expectedPayout);
        assertEq(feeRecipient.balance - feeBefore, expectedFee);

        IAgentEscrow.EscrowRecord memory e = escrow.getEscrow(id);
        assertEq(uint8(e.status), uint8(IAgentEscrow.EscrowStatus.Completed));
    }

    function test_dispute() public {
        bytes32 id = keccak256("dispute");
        _createSimpleEscrow(id, 1 ether);

        vm.prank(provider);
        escrow.dispute(id);

        IAgentEscrow.EscrowRecord memory e = escrow.getEscrow(id);
        assertEq(uint8(e.status), uint8(IAgentEscrow.EscrowStatus.Disputed));
    }

    function test_resolveDispute() public {
        bytes32 id = keccak256("resolve");
        _createSimpleEscrow(id, 1 ether);

        vm.prank(requester);
        escrow.dispute(id);

        uint256 providerBefore = provider.balance;
        uint256 requesterBefore = requester.balance;

        escrow.resolveDispute(id, 0.7 ether, 0.3 ether);

        uint256 providerFee = (0.7 ether * uint256(FEE_BPS)) / 10000;
        assertEq(provider.balance - providerBefore, 0.7 ether - providerFee);
        assertEq(requester.balance - requesterBefore, 0.3 ether);
    }

    function test_refund_afterDeadline() public {
        bytes32 id = keccak256("refund");
        _createSimpleEscrow(id, 1 ether);

        vm.warp(block.timestamp + 2 days);

        uint256 before = requester.balance;
        vm.prank(requester);
        escrow.refund(id);

        assertEq(requester.balance - before, 1 ether);
        IAgentEscrow.EscrowRecord memory e = escrow.getEscrow(id);
        assertEq(uint8(e.status), uint8(IAgentEscrow.EscrowStatus.Refunded));
    }

    function test_revert_refundBeforeDeadline() public {
        bytes32 id = keccak256("early");
        _createSimpleEscrow(id, 1 ether);

        vm.prank(requester);
        vm.expectRevert("Deadline not passed");
        escrow.refund(id);
    }

    function test_revert_duplicateEscrow() public {
        bytes32 id = keccak256("dup");
        _createSimpleEscrow(id, 1 ether);

        vm.prank(requester);
        vm.expectRevert("Escrow exists");
        uint256[] memory m = new uint256[](1);
        m[0] = 1 ether;
        escrow.createEscrow{value: 1 ether}(
            id, provider, address(0), m, block.timestamp + 1 days
        );
    }

    function test_revert_releaseWrongOrder() public {
        bytes32 id = keccak256("order");
        uint256[] memory milestones = new uint256[](2);
        milestones[0] = 1 ether;
        milestones[1] = 1 ether;

        vm.prank(requester);
        escrow.createEscrow{value: 2 ether}(
            id, provider, address(0), milestones, block.timestamp + 1 days
        );

        vm.prank(requester);
        vm.expectRevert("Wrong milestone order");
        escrow.releaseMilestone(id, 1);
    }

    function test_revert_nonRequesterRelease() public {
        bytes32 id = keccak256("auth");
        _createSimpleEscrow(id, 1 ether);

        vm.prank(provider);
        vm.expectRevert("Not requester");
        escrow.releaseMilestone(id, 0);
    }

    function test_pause() public {
        escrow.pause();

        bytes32 id = keccak256("paused");
        uint256[] memory m = new uint256[](1);
        m[0] = 1 ether;

        vm.prank(requester);
        vm.expectRevert();
        escrow.createEscrow{value: 1 ether}(
            id, provider, address(0), m, block.timestamp + 1 days
        );
    }
}
