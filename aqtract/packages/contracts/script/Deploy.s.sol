// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script, console} from "forge-std/Script.sol";
import {AgentEscrow} from "../src/AgentEscrow.sol";
import {AttestationRegistry} from "../src/AttestationRegistry.sol";

contract DeployScript is Script {
    function run() public {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address feeRecipient = vm.envAddress("FEE_RECIPIENT_ADDRESS");
        uint16 feeBps = uint16(vm.envUint("PLATFORM_FEE_BPS"));

        vm.startBroadcast(deployerKey);

        AgentEscrow escrow = new AgentEscrow(feeBps, feeRecipient);
        console.log("AgentEscrow deployed to:", address(escrow));

        AttestationRegistry registry = new AttestationRegistry();
        console.log("AttestationRegistry deployed to:", address(registry));

        vm.stopBroadcast();
    }
}
