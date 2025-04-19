import axios from 'axios';
import { ethers } from 'ethers';
import fs from 'fs';
import log from './utils/logger.js';
import getBanner from './utils/banner.js';
import activateMining from './utils/contract.js';

function readWallets() {
    if (fs.existsSync("wallets.json")) {
        const data = fs.readFileSync("wallets.json");
        return JSON.parse(data);
    } else {
        log.error("No wallets found", "wallets.json missing");
        process.exit(1);
    }
}

const API = 'https://lightmining-api.taker.xyz/';
const axiosInstance = axios.create({ baseURL: API });

const get = async (url, token) => {
    return await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

const post = async (url, data, config = {}) => {
    return await axiosInstance.post(url, data, config);
};

const sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));

async function signMessage(message, privateKey) {
    const wallet = new ethers.Wallet(privateKey);
    try {
        const signature = await wallet.signMessage(message);
        return signature;
    } catch (error) {
        log.error("Signature failed", error.message);
        return null;
    }
}

const getUser = async (token, retries = 3) => {
    try {
        const response = await get('user/getUserInfo', token);
        return response.data;
    } catch (error) {
        if (retries > 0) {
            log.warn("User info request failed", `Retrying (${retries - 1} attempts left)`);
            await sleep(3);
            return await getUser(token, retries - 1);
        }
        log.error("User info fetch failed", error.message);
        return null;
    }
};

const getNonce = async (walletAddress, retries = 3) => {
    try {
        const res = await post(`wallet/generateNonce`, { walletAddress });
        return res.data;
    } catch (error) {
        if (retries > 0) {
            log.warn("Nonce request failed", `Retrying (${retries - 1} attempts left)`);
            await sleep(3);
            return await getNonce(walletAddress, retries - 1);
        }
        log.error("Nonce fetch failed", error.message);
        return null;
    }
};

const login = async (address, message, signature, retries = 3) => {
    try {
        const res = await post(`wallet/login`, {
            address,
            invitationCode: "HZHGW1LS",
            message,
            signature,
        });
        return res.data.data;
    } catch (error) {
        if (retries > 0) {
            log.warn("Login failed", `Retrying (${retries - 1} attempts left)`);
            await sleep(3);
            return await login(address, message, signature, retries - 1);
        }
        log.error("Login failed after retries", error.message);
        return null;
    }
};

const getMinerStatus = async (token, retries = 3) => {
    try {
        const response = await get('assignment/totalMiningTime', token);
        return response.data;
    } catch (error) {
        if (retries > 0) {
            log.warn("Miner status fetch failed", `Retrying (${retries - 1} attempts left)`);
            await sleep(3);
            return await getMinerStatus(token, retries - 1);
        }
        log.error("Miner status fetch failed", error.message);
        return null;
    }
};

const startMine = async (token, retries = 3) => {
    try {
        const res = await post(
            `assignment/startMining`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.data;
    } catch (error) {
        if (retries > 0) {
            log.warn("Mining start failed", `Retrying (${retries - 1} attempts left)`);
            await sleep(3);
            return await startMine(token, retries - 1);
        }
        log.error("Mining start failed", error.message);
        return null;
    }
};

const main = async () => {
    console.log(getBanner());
    
    const wallets = readWallets();
    if (wallets.length === 0) {
        log.error("No wallets found", "Exiting program");
        process.exit(1);
    }

    while (true) {
        log.info("Starting wallet processing", `Total wallets: ${wallets.length}`);

        for (const wallet of wallets) {
            log.info("Processing wallet", wallet.address);

            const nonceData = await getNonce(wallet.address);
            if (!nonceData?.data?.nonce) {
                log.error("Nonce retrieval failed", wallet.address);
                continue;
            }

            const signature = await signMessage(nonceData.data.nonce, wallet.privateKey);
            if (!signature) {
                log.error("Message signing failed", wallet.address);
                continue;
            }

            log.info("Attempting login", wallet.address);
            const loginResponse = await login(wallet.address, nonceData.data.nonce, signature);
            if (!loginResponse?.token) {
                log.error("Login failed", wallet.address);
                continue;
            }
            log.success("Login successful", wallet.address);

            log.info("Fetching user info", wallet.address);
            const userData = await getUser(loginResponse.token);
            if (userData?.data) {
                const { userId, twName, totalReward } = userData.data;
                log.success("User info retrieved", `ID: ${userId}, Name: ${twName || 'N/A'}, Reward: ${totalReward}`);
                if (!twName) {
                    log.warn("Twitter/X not bound", `Skipping wallet: ${wallet.address}`);
                    continue;
                }
            } else {
                log.error("User data fetch failed", wallet.address);
                continue;
            }

            log.info("Checking miner status", wallet.address);
            const minerStatus = await getMinerStatus(loginResponse.token);
            if (minerStatus?.data) {
                const lastMiningTime = minerStatus.data?.lastMiningTime || 0;
                const nextMiningTime = lastMiningTime + 24 * 60 * 60;
                const nextDate = new Date(nextMiningTime * 1000);
                const dateNow = new Date();

                log.info("Last mining time", new Date(lastMiningTime * 1000).toLocaleString());
                if (dateNow > nextDate) {
                    log.info("Starting mining", wallet.address);
                    const mineResponse = await startMine(loginResponse.token);
                    if (mineResponse) {
                        log.success("Mining started", wallet.address);
                        log.info("Activating on-chain mining", wallet.address);
                        const miningSuccess = await activateMining(wallet.privateKey);
                        if (!miningSuccess) {
                            log.error("On-chain mining failed", "Insufficient balance or already mined");
                        }
                    } else {
                        log.error("Mining start failed", wallet.address);
                    }
                } else {
                    log.warn("Mining in progress", `Next mining: ${nextDate.toLocaleString()}`);
                }
            } else {
                log.error("Miner status fetch failed", wallet.address);
            }
        }

        log.info("All wallets processed", "Cooling down for 1 hour");
        await sleep(60 * 60);
    }
};

main().catch(error => {
    log.error("Main process error", error.message);
    process.exit(1);
});