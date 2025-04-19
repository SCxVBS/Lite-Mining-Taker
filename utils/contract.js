import { ethers } from 'ethers';
import log from './logger.js';

const provider = new ethers.JsonRpcProvider('https://rpc-mainnet.taker.xyz/');
const contractAddress = '0xB3eFE5105b835E5Dd9D206445Dbd66DF24b912AB';
const contractABI = [
    "function active() external"
];

async function activateMining(privateKey) {
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);
    try {
        const tx = await contract.active();
        await tx.wait();
        log.success('Mining activated successfully', `Transaction Hash: ${tx.hash}`);
        return tx.hash;
    } catch (error) {
        log.error('Failed to activate mining', error.message);
        return null;
    }
}

export default activateMining;