// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System } from "@latticexyz/world/src/System.sol";
import { Swap } from "../codegen/Tables.sol";
import { IVault } from "@balancer-labs/v2-interfaces/contracts/vault/IVault.sol";
import "@balancer-labs/v2-interfaces/contracts/standalone-utils/IBalancerRelayer.sol";

/**
 * Taken from Balancer contracts: https://github.com/balancer/balancer-v2-monorepo/blob/master/pkg/standalone-utils/contracts/relayer/BaseRelayerLibrary.sol
 * This only has VERY basic functionality and no safety checks - just a PoC to see how to adapt to MUD.
 *
 * Relayers are usually composed of two contracts:
 *  - A `BalancerRelayer` contract, which acts as a single point of entry into the system through a multicall function
 *  - A library contract such as this one, which defines the allowed behaviour of the relayer
 * Usually only the entrypoint contract should be allowlisted by Balancer governance as a relayer, so that the Vault
 * will reject calls from outside the entrypoint context. 
 * I had issues using the pattern - seemed to be related to delegateCall. So I went with a very simple single Relayer that can be called directly.
 */
contract RelayerSystem is System {
  IVault private immutable _vault;

  constructor() {
    _vault = IVault(address(0xBA12222222228d8Ba445958a75a0704d566BF2C8));
  }

  function getVault() public view returns (IVault) {
    return _vault;
  }

  function swap(
        IVault.SingleSwap memory singleSwap,
        IVault.FundManagement calldata funds,
        uint256 limit,
        uint256 deadline,
        uint256 value
    ) external payable returns (uint256) {
        require(funds.sender == msg.sender || funds.sender == address(this), "Incorrect sender");
        uint256 result = getVault().swap{ value: value }(singleSwap, funds, limit, deadline);
        bytes32 key = bytes32(abi.encodePacked(block.number, msg.sender, gasleft()));
        Swap.set(key, address(singleSwap.assetIn), address(singleSwap.assetOut), singleSwap.amount, result);
        return result;
  }
}
