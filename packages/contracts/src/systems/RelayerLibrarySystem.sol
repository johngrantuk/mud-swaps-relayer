// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System } from "@latticexyz/world/src/System.sol";
import { Counter, AddressBook } from "../codegen/Tables.sol";
import "./balancer/BalancerRelayer.sol";
import { IVault } from "@balancer-labs/v2-interfaces/contracts/vault/IVault.sol";
import "@balancer-labs/v2-interfaces/contracts/standalone-utils/IBalancerRelayer.sol";

/**
 * Taken from Balancer contracts: https://github.com/balancer/balancer-v2-monorepo/blob/master/pkg/standalone-utils/contracts/relayer/BaseRelayerLibrary.sol
 * This only has VERY basic functionality and limited safety checks - just a PoC to see how to adapt to MUD.
 *
 * Relayers are composed of two contracts:
 *  - A `BalancerRelayer` contract, which acts as a single point of entry into the system through a multicall function
 *  - A library contract such as this one, which defines the allowed behaviour of the relayer

 * NOTE: Only the entrypoint contract should be allowlisted by Balancer governance as a relayer, so that the Vault
 * will reject calls from outside the entrypoint context.
 *
 * This contract should neither be allowlisted as a relayer, nor called directly by the user.
 * No guarantees can be made about fund safety when calling this contract in an improper manner.
 */
contract RelayerLibrarySystem is System {
  IVault private immutable _vault;
  IBalancerRelayer private immutable _entrypoint;

  constructor() {
    _vault = IVault(address(0xBA12222222228d8Ba445958a75a0704d566BF2C8));
    _entrypoint = new BalancerRelayer(_vault, address(this));
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
        return result;
  }

  function updateEntryPoint() public returns (address) {
    AddressBook.set(address(_entrypoint));
    return address(_entrypoint);
  }

  function increment() public returns (uint32) {
    uint32 counter = Counter.get();
    uint32 newValue = counter + 1;
    Counter.set(newValue);
    return newValue;
  }
}
