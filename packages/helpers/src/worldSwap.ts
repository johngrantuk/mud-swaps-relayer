import { JsonRpcProvider } from '@ethersproject/providers';
import { IWorld__factory } from "../../contracts/types/ethers-contracts/factories/IWorld__factory";
import { Contract } from '@ethersproject/contracts';

import worldsJson from "../../contracts/worlds.json";
import vaultAbi from './abis/vaultAbi.json';

import { newRelayer, testAccount, balancerVaultAddr } from './constants';

const worlds = worldsJson as Partial<Record<string, { address: string; blockNumber?: number }>>;

async function worldSwap() {
    const rpcUrl = `http://127.0.0.1:8545`;
    const provider = new JsonRpcProvider(rpcUrl);

    // We impersonate the Balancer Governance Safe address as it is authorised to grant roles
    await provider.send('hardhat_impersonateAccount', [testAccount]);
    const signer = provider.getSigner(testAccount);
    const world = worlds['31337'];
    const worldAddress = world?.address || '';
    console.log(`World Address: `, world?.address);

    // Create a World contract instance
    const worldContract = IWorld__factory.connect(worldAddress, signer);

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

    const test = await worldContract.swap(singleSwap, funds, limit, deadline, '0');
    console.log(test);
}

// npx ts-node -P tsconfig.json ./src/worldSwap.ts
worldSwap();