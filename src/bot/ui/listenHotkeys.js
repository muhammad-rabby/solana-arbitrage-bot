const keypress = require("keypress");
const open = require("open");

const { DISCORD_INVITE_URL } = require("../../constants");
const { logExit } = require("../exit");
const cache = require("../cache");

const listenHotkeys = () => {
	keypress(process.stdin);

	process.stdin.on("keypress", function (ch, key) {
		if (key && key.ctrl && key.name == "c") {
			cache.ui.allowClear = false;
			// eslint-disable-next-line no-undef
			if (global.botInterval) clearInterval(botInterval);
			logExit(0, { message: "[CTRL]+[C] exiting by user " });
			process.exitCode = 0;
			process.stdin.setRawMode(false);
			process.exit(0);
		}

		// [E] - forced execution
		if (key && key.name === "e") {
			cache.hotkeys.e = true;
		}

		// [R] - revert back swap
		if (key && key.name === "r") {
			cache.hotkeys.r = true;
		}

		// [P] - switch profit chart visibility
		if (key && key.name === "p") {
			cache.ui.showProfitChart = !cache.ui.showProfitChart;
		}

		// [L] - switch performance chart visibility
		if (key && key.name === "l") {
			cache.ui.showPerformanceOfRouteCompChart =
				!cache.ui.showPerformanceOfRouteCompChart;
		}

		// [H] - switch trade history visibility
		if (key && key.name === "t") {
			cache.ui.showTradeHistory = !cache.ui.showTradeHistory;
		}

		// [I] - incognito mode (hide RPC)
		if (key && key.name === "i") {
			cache.ui.hideRpc = !cache.ui.hideRpc;
		}

		// [H] - switch help visibility
		if (key && key.name === "h") {
			cache.ui.showHelp = !cache.ui.showHelp;
		}

		// [S] - simulation mode switch
		if (key && key.name === "s") {
			cache.tradingEnabled = !cache.tradingEnabled;
		}

		// [D] - open discord invite link
		if (key && key.name === "d") {
			open(DISCORD_INVITE_URL);
		}
	});

	process.stdin.setRawMode(true);
	process.stdin.resume();
};

module.exports = listenHotkeys;
