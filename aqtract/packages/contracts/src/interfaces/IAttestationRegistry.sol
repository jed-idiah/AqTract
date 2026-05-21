// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IAttestationRegistry {
    struct Attestation {
        address attester;
        address subject;
        bytes32 contractHash;
        uint8 attestationType;
        uint8 score;
        bytes32 contentHash;
        uint256 timestamp;
    }

    event AttestationCreated(
        uint256 indexed id,
        address indexed attester,
        address indexed subject,
        bytes32 contractHash,
        uint8 score
    );

    function attest(
        address subject,
        bytes32 contractHash,
        uint8 attestationType,
        uint8 score,
        bytes32 contentHash
    ) external returns (uint256);

    function getAttestation(uint256 attestationId) external view returns (Attestation memory);
    function getAttestationCount(address subject) external view returns (uint256);
}
