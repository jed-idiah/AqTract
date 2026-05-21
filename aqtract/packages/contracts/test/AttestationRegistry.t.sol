// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Test} from "forge-std/Test.sol";
import {AttestationRegistry} from "../src/AttestationRegistry.sol";
import {IAttestationRegistry} from "../src/interfaces/IAttestationRegistry.sol";

contract AttestationRegistryTest is Test {
    AttestationRegistry public registry;
    address public attester = makeAddr("attester");
    address public subject = makeAddr("subject");

    function setUp() public {
        registry = new AttestationRegistry();
    }

    function test_attest() public {
        bytes32 contractHash = keccak256("contract1");
        bytes32 contentHash = keccak256("content1");

        vm.prank(attester);
        uint256 id = registry.attest(subject, contractHash, 0, 45, contentHash);

        assertEq(id, 1);

        IAttestationRegistry.Attestation memory a = registry.getAttestation(id);
        assertEq(a.attester, attester);
        assertEq(a.subject, subject);
        assertEq(a.contractHash, contractHash);
        assertEq(a.attestationType, 0);
        assertEq(a.score, 45);
        assertEq(a.contentHash, contentHash);
    }

    function test_attestationCount() public {
        bytes32 ch = keccak256("c");
        bytes32 content = keccak256("x");

        vm.startPrank(attester);
        registry.attest(subject, ch, 0, 40, content);
        registry.attest(subject, ch, 1, 50, content);
        registry.attest(subject, ch, 2, 30, content);
        vm.stopPrank();

        assertEq(registry.getAttestationCount(subject), 3);
    }

    function test_getSubjectAttestationIds() public {
        bytes32 ch = keccak256("c");
        bytes32 content = keccak256("x");

        vm.startPrank(attester);
        registry.attest(subject, ch, 0, 40, content);
        registry.attest(subject, ch, 1, 50, content);
        registry.attest(subject, ch, 2, 30, content);
        vm.stopPrank();

        uint256[] memory ids = registry.getSubjectAttestationIds(subject, 0, 10);
        assertEq(ids.length, 3);
        assertEq(ids[0], 1);
        assertEq(ids[1], 2);
        assertEq(ids[2], 3);

        uint256[] memory page = registry.getSubjectAttestationIds(subject, 1, 1);
        assertEq(page.length, 1);
        assertEq(page[0], 2);
    }

    function test_revert_selfAttestation() public {
        vm.prank(subject);
        vm.expectRevert("Self-attestation");
        registry.attest(subject, keccak256("c"), 0, 40, keccak256("x"));
    }

    function test_revert_scoreTooHigh() public {
        vm.prank(attester);
        vm.expectRevert("Score max 50");
        registry.attest(subject, keccak256("c"), 0, 51, keccak256("x"));
    }

    function test_revert_invalidType() public {
        vm.prank(attester);
        vm.expectRevert("Invalid type");
        registry.attest(subject, keccak256("c"), 4, 40, keccak256("x"));
    }

    function test_pause() public {
        registry.pause();

        vm.prank(attester);
        vm.expectRevert();
        registry.attest(subject, keccak256("c"), 0, 40, keccak256("x"));
    }
}
