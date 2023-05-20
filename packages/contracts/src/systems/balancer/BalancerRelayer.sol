pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@balancer-labs/v2-interfaces/contracts/standalone-utils/IBalancerRelayer.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * Taken from Balancer contracts: https://github.com/balancer/balancer-v2-monorepo/blob/master/pkg/standalone-utils/contracts/relayer/BalancerRelayer.sol
 * This only has VERY basic functionality and limited safety checks - just a PoC to see how to adapt to MUD.
 *
 * Relayers are composed of two contracts:
 *  - This contract, which acts as a single point of entry into the system through a multicall function.
 *  - A library contract, which defines the allowed behaviour of the relayer.
 *
 * The relayer entrypoint can then repeatedly delegatecall into the library's code to perform actions.
 * We can then run combinations of the library contract's functions in the context of the relayer entrypoint,
 * without having to expose all these functions on the entrypoint contract itself. The multicall function is
 * then a single point of entry for all actions, so we can easily prevent reentrancy.
 *
 * This design gives much stronger reentrancy guarantees, as otherwise a malicious contract could reenter
 * the relayer through another function (which must allow reentrancy for multicall logic), and that would
 * potentially allow them to manipulate global state, resulting in loss of funds in some cases:
 * e.g., sweeping any leftover ETH that should have been refunded to the user.
 *
 * NOTE: Only the entrypoint contract should be allowlisted by Balancer governance as a relayer, so that the
 * Vault will reject calls from outside the context of the entrypoint: e.g., if a user mistakenly called directly
 * into the library contract.
 */
// contract BalancerRelayer is IBalancerRelayer, ReentrancyGuard {
contract BalancerRelayer is IBalancerRelayer {
    using Address for address payable;
    using Address for address;

    IVault private immutable _vault;
    address private immutable _library;

    /**
     * @dev This contract is not meant to be deployed directly by an EOA, but rather during construction of a contract
     * derived from `BaseRelayerLibrary`, which will provide its own address as the relayer's library.
     */
    constructor(IVault vault, address libraryAddress) {
        _vault = vault;
        _library = libraryAddress;
    }

    receive() external payable {
        // Only accept ETH transfers from the Vault. This is expected to happen due to a swap/exit/withdrawal
        // with ETH as an output, should the relayer be listed as the recipient. This may also happen when
        // joining a pool, performing a swap, or if managing a user's balance uses less than the full ETH value
        // provided. Any excess ETH will be refunded to this contract, and then forwarded to the original sender.
        require(msg.sender == address(_vault), "Eth Transfer Error");
    }

    function getVault() external view override returns (IVault) {
        return _vault;
    }

    function getLibrary() external view override returns (address) {
        return _library;
    }

    // function multicall(bytes[] calldata data) external payable override nonReentrant returns (bytes[] memory results) {
    function multicall(bytes[] calldata data) external payable override returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i = 0; i < data.length; i++) {
            results[i] = _library.functionDelegateCall(data[i]);
        }

        _refundETH();
    }

    function _refundETH() private {
        uint256 remainingEth = address(this).balance;
        if (remainingEth > 0) {
            payable(msg.sender).sendValue(remainingEth);
        }
    }
}
