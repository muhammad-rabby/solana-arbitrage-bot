#!/usr/bin/env node
"use strict";
const React = require("react");
const importJsx = require("import-jsx");
const { render } = require("ink");
const meow = require("meow");

// check for .env file
const { checkForEnvFile, checkWallet, checkArbReady } = require("./utils");
checkForEnvFile();

require("dotenv").config();

checkWallet();

const isArbReady = async () => {
    try {
        // Display the message
        await checkArbReady();
        return true; // If checkArbReady completes without errors, return true
    } catch (error) {
        spinner.text = chalk.black.bgRedBright(
            `\n${error.message}\n`
        );
        logExit(1, error);
        process.exit(1); // Exit the process if there's an error
    }
};

isArbReady().then((arbReady) => {
	if (!arbReady) {
        process.exit(1); // Exit the process if ARB is not ready
    }
});

const wizard = importJsx("./wizard/index");

const cli = meow(`
	Usage
	  $ solana-jupiter-bot

	Options
		--name  Your name

	Examples
	  $ solana-jupiter-bot --name=Jane
	  Hello, Master
`);

console.clear();

render(React.createElement(wizard, cli.flags)).waitUntilExit();