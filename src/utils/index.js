const chalk = require("chalk");
const fs = require("fs");
const ora = require("ora-classic");
const { logExit } = require("../bot/exit");
const JSBI = require('jsbi');
const bs58 = require("bs58");
const { PublicKey, Connection, Keypair } = require("@solana/web3.js");
require("dotenv").config();

const createTempDir = () => !fs.existsSync("./temp") && fs.mkdirSync("./temp");

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    } else if (typeof value === "bigint") {
        value = value.toString();
    }
    return value;
  };
};

const storeItInTempAsJSON = (filename, data) =>
        fs.writeFileSync(`./temp/${filename}.json`, JSON.stringify(data, getCircularReplacer(), 2));

const createConfigFile = (config) => {
	const configSpinner = ora({
		text: "Creating config...",
		discardStdin: false,
	}).start();
	
	// Set the adaptive slippage setting based on initial configuration
	const adaptiveslippage = config?.adaptiveslippage?.value ?? 0;

	const configValues = {
		network: config.network.value,
		rpc: config.rpc.value,
		tradingStrategy: config.strategy.value,
		tokenA: config.tokens.value.tokenA,
		tokenB: config.tokens.value.tokenB,
		slippage: config.slippage.value,
		adaptiveSlippage: adaptiveslippage,
		priority: config.priority.value,
		minPercProfit: config.profit.value,
		minInterval: parseInt(config.advanced.value.minInterval),
		tradeSize: {
			value: parseFloat(config["trading size"].value.value),
			strategy: config["trading size"].value.strategy,
		},
		ui: {
			defaultColor: "cyan",
		},
		storeFailedTxInHistory: true,
	};

	fs.writeFileSync("./config.json", JSON.stringify(configValues, null, 2), {});
	configSpinner.succeed("Config created!");
};

const verifyConfig = (config) => {
	let result = true;
	const badConfig = [];
	Object.entries(config).forEach(([key, value]) => {
		const isSet = value.isSet;
		const isSectionSet =
			isSet instanceof Object
				? Object.values(isSet).every((value) => value === true)
				: isSet;

		if (!isSectionSet) {
			result = false;
			badConfig.push(key);
		}
	});
	return { result, badConfig };
};

/**
 * It loads the config file and returns the config object
 * @returns The config object
 */
const loadConfigFile = ({ showSpinner = false }) => {
	let config = {};
	let spinner;
	if (showSpinner) {
		spinner = ora({
			text: "Loading config...",
			discardStdin: false,
		}).start();
	}

	if (fs.existsSync("./config.json")) {
		config = JSON.parse(fs.readFileSync("./config.json"));
		spinner?.succeed("Config loaded!");
		return config;
	}

	spinner?.fail(chalk.redBright("Loading config failed!\n"));
	throw new Error("\nNo config.json file found!\n");
};

const calculateProfit = ((oldVal, newVal) => ((newVal - oldVal) / oldVal) * 100);

const toDecimal = (number, decimals) =>
	parseFloat(String(number) / 10 ** decimals).toFixed(decimals);


const toNumber = (number, decimals) => 
	Math.floor(String(number) * 10 ** decimals);

/**
 * It calculates the number of iterations per minute and updates the cache.
 */
const updateIterationsPerMin = (cache) => {
	const iterationTimer =
		(performance.now() - cache.iterationPerMinute.start) / 1000;

	if (iterationTimer >= 60) {
		cache.iterationPerMinute.value = Number(
			cache.iterationPerMinute.counter.toFixed()
		);
		cache.iterationPerMinute.start = performance.now();
		cache.iterationPerMinute.counter = 0;
	} else cache.iterationPerMinute.counter++;
};

const checkRoutesResponse = (routes) => {
	if (Object.hasOwn(routes, "routesInfos")) {
		if (routes.routesInfos.length === 0) {
			console.log(routes);
			logExit(1, {
				message: "No routes found or something is wrong with RPC / Jupiter! ",
			});
			process.exit(1);
		}
	} else {
		console.log(routes);
		logExit(1, {
			message: "Something is wrong with RPC / Jupiter! ",
		});
		process.exit(1);
	}
};

function displayMessage(message) {
    console.clear(); // Clear console before displaying message
    const lineLength = 50; // Length of each line
    const paddingLength = Math.max(0, Math.floor((lineLength - message.length) / 2)); // Calculate padding length for centering, ensuring it's non-negative
    const padding = "-".repeat(paddingLength); // Create padding string
    const displayMessage = `${padding}\x1b[93m${message}\x1b[0m${padding}`; // Create display message with padding and light yellow color ANSI escape codes

	console.log("\n");
	console.log(`\x1b[1m${'ARB PROTOCOL BOT SETUP TESTS'}\x1b[0m\n`); 
	console.log("\x1b[93m*\x1b[0m".repeat(lineLength / 2)); // Display top border in light yellow
    console.log(`\n${displayMessage}\n`); // Display message
    console.log("\x1b[93m*\x1b[0m".repeat(lineLength / 2)); // Display bottom border in light yellow
	console.log("\n");
}

const checkForEnvFile = () => {
	if (!fs.existsSync("./.env")) {
		displayMessage("Please refer to the readme to set up the Bot properly.\n\nYou have not created the .ENV file yet.\n\nRefer to the .env.example file.");
		logExit(1, {
			message: "No .env file found! ",
		});
		process.exit(1);
	}
};
const checkWallet = () => {
	if (
		!process.env.SOLANA_WALLET_PRIVATE_KEY ||
		(process.env.SOLANA_WALLET_PUBLIC_KEY &&
			process.env.SOLANA_WALLET_PUBLIC_KEY?.length !== 88)
	) {
		displayMessage(`${process.env.SOLANA_WALLET_PUBLIC_KEY} Your wallet is not valid. \n\nCheck the .env file and ensure you have put in the private key in the correct format. \n\ni.e. SOLANA_WALLET_PRIVATE_KEY=3QztVpoRgLNvAmBX9Yo3cjR3bLrXVrJZbPW5BY7GXq8GFvEjR4xEDeVai85a8WtYUCePvMx27eBut5K2kdqN8Hks`);
		process.exit(1);
	}
}

const checkArbReady = async () => {
	/* try{
		// Support the community
		const ARB_TOKEN =  '9tzZzEHsKnwFL1A3DyFJwj36KnZj3gZ7g4srWp9YTEoh';

		var checkBalance = Number(0);
		const connection = new Connection(process.env.DEFAULT_RPC);
		wallet = Keypair.fromSecretKey(bs58.decode(process.env.SOLANA_WALLET_PRIVATE_KEY));

		const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
			mint: new PublicKey(ARB_TOKEN)
		});

		let totalTokenBalance = BigInt(0);
		tokenAccounts.value.forEach((accountInfo) => {
			const parsedInfo = accountInfo.account.data.parsed.info;
			totalTokenBalance += BigInt(parsedInfo.tokenAmount.amount);
		});

		// Do you support the project and the hard work of the developers?
		var arb_ready = Number(totalTokenBalance);
		if (arb_ready < 10000000000) {
			console.clear(); // Clear console before displaying message
			displayMessage("You are not ARB ready! You need to hold at least 10K in ARB in your trading wallet to use this bot.");
			process.exit(1);
		}

        // Check if there are no ATAs for the specified token
        if (tokenAccounts.value.length === 0) {
            console.clear(); // Clear console before displaying message
            displayMessage("You are not ARB ready! You need to hold at least 10K in ARB in your trading wallet to use this bot.");
            process.exit(1);
        }
		return true;
	} catch (err){
		console.clear(); // Clear console before displaying message
		displayMessage("You do not seem to be ARB ready!\n\nCheck the .ENV file to see your RPC is set up properly and your wallet is set to the correct private key.");
		process.exit(1);
	} */
		return true;
};

module.exports = {
	createTempDir,
	storeItInTempAsJSON,
	createConfigFile,
	loadConfigFile,
	verifyConfig,
	calculateProfit,
	toDecimal,
	toNumber,
	updateIterationsPerMin,
	checkRoutesResponse,
	checkForEnvFile,
	checkArbReady,
	checkWallet,
};
