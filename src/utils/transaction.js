require("dotenv").config();
const { Connection, PublicKey } = require("@solana/web3.js");
const { setTimeout } = require("timers/promises");
const cache = require("../bot/cache");
const { loadConfigFile, toNumber, calculateProfit, toDecimal } = require("./index.js");

cache.config = loadConfigFile({ showSpinner: true });

// Adding a backup option for the transaction lookup
// This is only needed for some RPCS that are not 
// working or are behind at the time of lookup.
const rpc_main = cache.config.rpc[0];
const rpc_backup = 'https://api.mainnet-beta.solana.com';

// Key variables
var transstatus = 0;
var transid = '';
var transresp = [];

const WAIT_ERROR_CODE = 1;
const WAIT_SUCCESS_CODE = 0;

const waitabit = async (ms) => {
    try {
        await setTimeout(ms);
        console.log('Waited for', ms, 'milliseconds.');
        return WAIT_SUCCESS_CODE;
    } catch (error) {
        console.error('Error occurred while waiting:', error);
        return WAIT_ERROR_CODE;
    }
};

// Main RPC
const connection = new Connection(rpc_main, {
    disableRetryOnRateLimit: true,
    commitment: 'confirmed',
});

// Backup RPC
const connection_backup = new Connection(rpc_backup, {
    disableRetryOnRateLimit: false,
    commitment: 'confirmed',
});

const fetchTransaction = async (rpcConnection, transaction) => {
    try {
        return await rpcConnection.getParsedTransaction(transaction, { "maxSupportedTransactionVersion": 0 });
    } catch (error) {
        // Handle errors, or let the caller handle them.
        console.error("Error fetching transaction:", error);
        return null;
    }
};

const checkTransactionStatus = async (transaction, wallet_address) => {
    try {
        const primaryTransaction = await fetchTransaction(connection, transaction);
        
        if (!primaryTransaction) {
            // If primary RPC fails, try backup RPC
            return await fetchTransaction(connection_backup, transaction);
        }

        return primaryTransaction;
    } catch (error) {
        console.error("Error checking transaction status:", error);
        return null;
    }

};

const checktrans = async (txid,wallet_address) => {
    try {
        transresp = await checkTransactionStatus(txid, wallet_address);
    
        if (transresp) {
            var transaction_changes = [];

            if (transresp.meta?.status.Err){
                // Failed Transaction
                return [transresp.meta.status.err,2];
            } else {
                transstatus = 1;
            }

            // Check if postTokenBalances is null or empty
            if (!transresp.meta.postTokenBalances || transresp.meta.postTokenBalances.length === 0) {
                return [null, WAIT_ERROR_CODE];
            }

            var tokenamt=0;
            var tokendec=0;

            // Outgoing SOL native mgmt
            // Handle transfers of SOL that would not show up due to wrapping
            if (transresp.meta.innerInstructions){
                for (instructions of transresp.meta.innerInstructions){
                    if(instructions.instructions){
                        for (parsed of instructions.instructions){
                            //console.log(JSON.stringify(parsed, null, 4));
                            if (parsed.parsed){
                                if (parsed.parsed.type=='transferChecked'){
                                    if (parsed.parsed.info.authority==wallet_address && parsed.parsed.info.mint=='So11111111111111111111111111111111111111112'){
                                        tokenamt = Number(parsed.parsed.info.tokenAmount.amount);
                                        tokendec = parsed.parsed.info.tokenAmount.decimals;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // SOL Transfer handling
            if (tokenamt>0){
                transaction_changes['So11111111111111111111111111111111111111112'] = { status: transstatus, start: tokenamt, decimals: tokendec, end: 0, change: (-1*tokenamt) };
            }

            // Pre Token Balance Handling
            for (token of transresp.meta.preTokenBalances){
                if (token.owner==wallet_address){
                    transaction_changes[token.mint.toString()] = {status: transstatus, start: token.uiTokenAmount.amount, decimals: token.uiTokenAmount.decimals};
                };
            }

            // Post Token Handling
            for (token of transresp.meta.postTokenBalances){
                if (token.owner==wallet_address){
                    if (transaction_changes[token.mint]?.start) {
                        // Case where token account existed already
                        diff = Number(token.uiTokenAmount.amount)-Number(transaction_changes[token.mint].start);
                        diffdec = toDecimal(diff,transaction_changes[token.mint].decimals);
                        transaction_changes[token.mint] = {...transaction_changes[token.mint], end: token.uiTokenAmount.amount, change: diff} 
                    } else {
                        // Case where token did not exist yet
                        // Set the initial to 0
                        transaction_changes[token.mint] = {status: transstatus, start: 0, decimals: token.uiTokenAmount.decimals};
                        // Calculate the difference
                        diff = Number(token.uiTokenAmount.amount)-Number(transaction_changes[token.mint].start);
                        diffdec = toDecimal(diff,transaction_changes[token.mint].decimals);
                        transaction_changes[token.mint] = {...transaction_changes[token.mint], end: token.uiTokenAmount.amount, change: diff} 
                    }
                }
            }
            return [transaction_changes, WAIT_SUCCESS_CODE];
        } else {
            // Transaction not found or error occurred
            return [null, WAIT_ERROR_CODE];
        }
    } catch(error) {
        console.error('Error checking transaction:', error);
        return [null, WAIT_ERROR_CODE];
    }
}

module.exports = {checktrans};