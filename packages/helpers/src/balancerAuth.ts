import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';

import authoriserAbi from './abis/authoriserAbi.json';

const authoriserAddr = '0xA331D84eC860Bf466b4CdCcFb4aC09a1B43F3aE6';
const governanceSafeAddr = '0x10A19e7eE7d7F8a52822f6817de8ea18204F2e4f';
const balancerVaultAddr = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
const roles = ["0x1282ab709b2b70070f829c46bc36f76b32ad4989fecb2fcb09a1b3ce00bbfc30", "0xc149e88b59429ded7f601ab52ecd62331cac006ae07c16543439ed138dcb8d34", "0x78ad1b68d148c070372f8643c4648efbb63c6a8a338f3c24714868e791367653", "0xeba777d811cd36c06d540d7ff2ed18ed042fd67bbf7c9afcf88c818c7ee6b498", "0x0014a06d322ff07fcc02b12f93eb77bb76e28cdee4fc0670b9dec98d24bbfec8", "0x7b8a1d293670124924a0f532213753b89db10bde737249d4540e9a03657d1aff"];
// Can be used as a check - it should already be authorised:
const relayerAccount = "0xfeA793Aa415061C483D2390414275AD314B3F621";
const newRelayer = "0x14ddc655a2f48cc0a4160a8c59b33ad6b67de05e";

async function authAccount(account: string) {
    console.log('Authorizing account: ', account);
    const rpcUrl = `http://127.0.0.1:8545`;
    const provider = new JsonRpcProvider(rpcUrl);

    // We impersonate the Balancer Governance Safe address as it is authorised to grant roles
    await provider.send('hardhat_impersonateAccount', [governanceSafeAddr]);
    const signer = provider.getSigner(governanceSafeAddr);

    const authoriser = new Contract(authoriserAddr, authoriserAbi, signer);

    const canPerformBefore = await authoriser.callStatic.canPerform(roles[0], account, balancerVaultAddr);

    const tx = await authoriser.grantRoles(roles, account);
    // console.log(tx);
    const receipt = await tx.wait();
    // console.log(receipt);
    const canPerformNewAfter = await authoriser.callStatic.canPerform(roles[0], account, balancerVaultAddr);
    console.log(canPerformBefore, canPerformNewAfter);
}

// npx ts-node -P tsconfig.json ./src/balancerAuth.ts
authAccount(newRelayer);
