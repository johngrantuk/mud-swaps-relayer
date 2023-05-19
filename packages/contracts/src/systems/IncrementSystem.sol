// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System } from "@latticexyz/world/src/System.sol";
import { Counter } from "../codegen/Tables.sol";
import "./balancer/BalancerRelayer.sol";
import { IVault } from "@balancer-labs/v2-interfaces/contracts/vault/IVault.sol";
import "@balancer-labs/v2-interfaces/contracts/standalone-utils/IBalancerRelayer.sol";


contract IncrementSystem is System {
  IVault private immutable _vault;
  IBalancerRelayer private immutable _entrypoint;

  constructor() {
    _vault = IVault(address(0xBA12222222228d8Ba445958a75a0704d566BF2C8));
    _entrypoint = new BalancerRelayer(_vault, address(this));
  }

  // function getVault() public view returns (IVault) {
  //   return _vault;
  // }

  function swap(
        IVault.SingleSwap memory singleSwap,
        IVault.FundManagement calldata funds,
        uint256 limit,
        uint256 deadline,
        uint256 value
    ) external payable {
        require(funds.sender == msg.sender || funds.sender == address(this), "Incorrect sender");
        // uint256 result = getVault().swap{ value: value }(singleSwap, funds, limit, deadline);
        uint256 result = _vault.swap{ value: value }(singleSwap, funds, limit, deadline);
  }

  function increment() public returns (uint32) {
    uint32 counter = Counter.get();
    uint32 newValue = counter + 1;
    Counter.set(newValue);
    return newValue;
  }
}
