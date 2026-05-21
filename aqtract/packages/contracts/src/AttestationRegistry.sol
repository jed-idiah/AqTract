// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IAttestationRegistry} from "./interfaces/IAttestationRegistry.sol";

contract AttestationRegistry is IAttestationRegistry, Ownable2Step, Pausable {
    uint256 private _nextId = 1;

    mapping(uint256 => Attestation) private _attestations;
    mapping(address => uint256) private _subjectCounts;
    mapping(address => uint256[]) private _subjectAttestationIds;

    constructor() Ownable(msg.sender) {}

    function attest(
        address subject,
        bytes32 contractHash,
        uint8 attestationType,
        uint8 score,
        bytes32 contentHash
    ) external whenNotPaused returns (uint256) {
        require(subject != address(0), "Invalid subject");
        require(subject != msg.sender, "Self-attestation");
        require(score <= 50, "Score max 50");
        require(attestationType <= 3, "Invalid type");

        uint256 id = _nextId++;

        _attestations[id] = Attestation({
            attester: msg.sender,
            subject: subject,
            contractHash: contractHash,
            attestationType: attestationType,
            score: score,
            contentHash: contentHash,
            timestamp: block.timestamp
        });

        _subjectCounts[subject]++;
        _subjectAttestationIds[subject].push(id);

        emit AttestationCreated(id, msg.sender, subject, contractHash, score);
        return id;
    }

    function getAttestation(uint256 attestationId) external view returns (Attestation memory) {
        require(_attestations[attestationId].timestamp != 0, "Not found");
        return _attestations[attestationId];
    }

    function getAttestationCount(address subject) external view returns (uint256) {
        return _subjectCounts[subject];
    }

    function getSubjectAttestationIds(
        address subject,
        uint256 offset,
        uint256 limit
    ) external view returns (uint256[] memory) {
        uint256[] storage ids = _subjectAttestationIds[subject];
        uint256 end = offset + limit;
        if (end > ids.length) end = ids.length;
        if (offset >= ids.length) return new uint256[](0);

        uint256[] memory result = new uint256[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = ids[i];
        }
        return result;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
