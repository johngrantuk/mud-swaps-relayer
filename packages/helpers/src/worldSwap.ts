import { JsonRpcProvider } from '@ethersproject/providers';
import { parseFixed } from '@ethersproject/bignumber';
import { IWorld__factory } from "../../contracts/types/ethers-contracts/factories/IWorld__factory";
import { getWorldAddress } from './mud';
import { testAccount } from './constants';

async function worldSwap() {
    const rpcUrl = `http://127.0.0.1:8545`;
    const provider = new JsonRpcProvider(rpcUrl);

    // We impersonate the Balancer Governance Safe address as it is authorised to grant roles
    await provider.send('hardhat_impersonateAccount', [testAccount]);
    const signer = provider.getSigner(testAccount);

    const worldAddress = getWorldAddress();
    // Create a World contract instance
    const worldContract = IWorld__factory.connect(worldAddress, signer);

    const amount = Math.floor(Math.random() * 6) + 1;

    const singleSwap = {
        poolId: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
        kind: '0',
        assetIn: '0xba100000625a3754423978a60c9317c58a424e3d',
        assetOut: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        amount: parseFixed(amount.toString(), 15),
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
    
    const test = await worldContract.swap(singleSwap, funds, limit, deadline, '0');
    console.log(test);
}

// npx ts-node -P tsconfig.json ./src/worldSwap.ts
worldSwap();