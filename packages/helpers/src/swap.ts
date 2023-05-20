import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';

import vaultAbi from '../vaultAbi.json';
import relayerAbi from '../../contracts/out/BalancerRelayer.sol/BalancerRelayer.abi.json'
import relayerLibraryAbi from '../../contracts/out/IncrementSystem.sol/IncrementSystem.abi.json';

const testAccount = '0xdf330Ccb1d8fE97D176850BC127D0101cBe4e932';
const balancerVaultAddr = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
const newRelayer = "0x14ddc655a2f48cc0a4160a8c59b33ad6b67de05e";

async function makeSwap() {
    console.log('making swap...');
    const rpcUrl = `http://127.0.0.1:8545`;
    const provider = new JsonRpcProvider(rpcUrl);

    // We impersonate the Balancer Governance Safe address as it is authorised to grant roles
    await provider.send('hardhat_impersonateAccount', [testAccount]);
    const signer = provider.getSigner(testAccount);

    const vault = new Contract(balancerVaultAddr, vaultAbi, signer);

    const tx = await vault.setRelayerApproval(testAccount, newRelayer, true);
    await tx.wait();
    const relayerApproved = await vault.callStatic.hasApprovedRelayer(testAccount, newRelayer);
    console.log(`relayerApproved: `, relayerApproved);

    const singleSwap = {
        poolId: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
        kind: '0',
        assetIn: '0xba100000625a3754423978a60c9317c58a424e3d',
        assetOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        amount: '1000000000000000',
        userData: '0x'
    };
    const funds = {
        sender: testAccount,
        fromInternalBalance: false,
        recipient: testAccount,
        toInternalBalance: false
    }
    const limit = '0';
    const deadline = '999999999999999999';
    
    const swapTxSim = await vault.callStatic.swap(singleSwap, funds, limit, deadline);
    console.log(swapTxSim.toString());
    console.log(swapTxSim.toHexString());
    // const swapTx = await vault.swap(singleSwap, funds, limit, deadline);
    // const receipt = await swapTx.wait();
    // console.log(receipt);

    const relayerLibrary = new Contract(newRelayer, relayerLibraryAbi, signer);
    const encodedSwap = relayerLibrary.interface.encodeFunctionData('swap', [
      singleSwap,
      funds,
      limit,
      deadline,
      '0',
    ]);
    const relayer = new Contract(newRelayer, relayerAbi, signer);
    const relayerTxSim = await relayer.callStatic.multicall([encodedSwap]);
    console.log(relayerTxSim);

}

// npx ts-node -P tsconfig.json ./src/swap.ts
makeSwap();
