const fs = require("fs");
const chalk = require("chalk");
const cache = require("./cache");
const logExit = (code = 0, error) => {
	code === 0 && console.log(chalk.black.bgMagentaBright.bold(error.message));

	if (code === 1) {
		error?.message &&
			console.log(
				chalk.black.bgRedBright.black("ERROR: " + chalk.bold(error.message))
			);
		error?.stack && console.log(chalk.redBright(error.stack));

		if (cache.isSetupDone) {
			console.log(
				chalk.black.bgYellowBright(
					"Closing connections... ",
					chalk.bold("WAIT! ")
				)
			);
			console.log(chalk.yellowBright.bgBlack("Press [Ctrl]+[C] to force exit"));
		}
	}
};

const handleExit = () => {
	try {
		console.log(
			chalk.black.bgMagentaBright(
				`\n	Exit time:  ${chalk.bold(new Date().toLocaleString())} `
			)
		);

		// write cache to file
		try {
			fs.writeFileSync("./temp/cache.json", JSON.stringify(cache, null, 2));
			console.log(
				chalk.black.bgGreenBright(
					`		> Cache saved to ${chalk.bold("./temp/cache.json")} `
				)
			);
		} catch (error) {
			console.log(
				chalk.black.bgRedBright(
					`		X Error saving cache to ${chalk.bold("./temp/cache.json")} `
				)
			);
		}

		// write trade history to file
		try {
			fs.writeFileSync(
				"./temp/tradeHistory.json",
				JSON.stringify(cache.tradeHistory, null, 2)
			);
			console.log(
				chalk.black.bgGreenBright(
					`		> Trade history saved to ${chalk.bold("./temp/tradeHistory.json")} `
				)
			);
		} catch (error) {
			console.log(
				chalk.black.bgRedBright(
					`		X Error saving trade history to ${chalk.bold(
						"./temp/tradeHistory.json"
					)} `
				)
			);
		}
		console.log(chalk.black.bgMagentaBright.bold("	Exit Done! \n"));
	} catch (error) {
		console.log(error);
	}
};

module.exports = { logExit, handleExit };
