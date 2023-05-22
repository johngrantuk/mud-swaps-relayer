import { JsonRpcProvider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { balancerVaultAddr, governanceSafeAddr, authoriserAddr, testAccount } from './constants';
import { getWorldAddress } from './mud';

import authoriserAbi from './abis/authoriserAbi.json';
import vaultAbi from './abis/vaultAbi.json';

async function grantRelayerRoles(account: string) {
    const rpcUrl = `http://127.0.0.1:8545`;
    const provider = new JsonRpcProvider(rpcUrl);
    // These are the join/exit/swap roles for Vault
    const roles = ["0x1282ab709b2b70070f829c46bc36f76b32ad4989fecb2fcb09a1b3ce00bbfc30", "0xc149e88b59429ded7f601ab52ecd62331cac006ae07c16543439ed138dcb8d34", "0x78ad1b68d148c070372f8643c4648efbb63c6a8a338f3c24714868e791367653", "0xeba777d811cd36c06d540d7ff2ed18ed042fd67bbf7c9afcf88c818c7ee6b498", "0x0014a06d322ff07fcc02b12f93eb77bb76e28cdee4fc0670b9dec98d24bbfec8", "0x7b8a1d293670124924a0f532213753b89db10bde737249d4540e9a03657d1aff"];
    // We impersonate the Balancer Governance Safe address as it is authorised to grant roles
    await provider.send('hardhat_impersonateAccount', [governanceSafeAddr]);
    const signer = provider.getSigner(governanceSafeAddr);

    const authoriser = new Contract(authoriserAddr, authoriserAbi, signer);

    const canPerformBefore = await authoriser.callStatic.canPerform(roles[0], account, balancerVaultAddr);

    // Grants the set roles for the account to perform on behalf of users
    const tx = await authoriser.grantRoles(roles, account);
    await tx.wait();
    const canPerformAfter = await authoriser.callStatic.canPerform(roles[0], account, balancerVaultAddr);
    console.log(canPerformBefore, canPerformAfter);
}

async function approveRelayer(account: string, relayer: string) {
    const rpcUrl = `http://127.0.0.1:8545`;
    const provider = new JsonRpcProvider(rpcUrl);
    await provider.send('hardhat_impersonateAccount', [account]);
    const signer = provider.getSigner(account);
    const vault = new Contract(balancerVaultAddr, vaultAbi, signer);
    const tx = await vault.setRelayerApproval(account, relayer, true);
    await tx.wait();
    const relayerApproved = await vault.callStatic.hasApprovedRelayer(account, relayer);
    console.log(`relayerApproved: `, relayerApproved);
}

async function authAccount() {
    const worldAddr = getWorldAddress();
    console.log('Authorizing world address: ', worldAddr);
    await grantRelayerRoles(worldAddr);
    console.log('Approving Relayer (world) for user.')
    await approveRelayer(testAccount, worldAddr);
}

// npx ts-node -P tsconfig.json ./src/balancerAuth.ts
authAccount();
