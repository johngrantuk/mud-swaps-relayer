import { JsonRpcProvider } from '@ethersproject/providers';
import { SetupNetworkResult } from "./setupNetwork";
import { testAccount } from '../../../helpers/src/constants';

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  { worldContract }: SetupNetworkResult
) {
  const worldSwap = async (poolId: string, assetIn: string, assetOut: string, amount: string) => {
    const rpcUrl = `http://127.0.0.1:8545`;
    const provider = new JsonRpcProvider(rpcUrl);
    // Impersonates testAccount which we know has balances for swapping
    await provider.send('hardhat_impersonateAccount', [testAccount]);
    const signer = provider.getSigner(testAccount);
    const singleSwap = {
        poolId,
        kind: '0',
        assetIn,
        assetOut,
        amount,
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
    console.log(`Sending swap...`);
    const test = await worldContract.connect(signer).swap(singleSwap, funds, limit, deadline, '0');
    console.log(`Did it work?`)
  };

  return {
    worldSwap,
  };
}
