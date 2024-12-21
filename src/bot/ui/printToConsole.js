const ui = require("cliui")({ width: 140 });
const chalk = require("chalk");
const moment = require("moment");
const chart = require("asciichart");
const JSBI = require('jsbi');

const { toDecimal } = require("../../utils");
const package = require("../../../package.json");
const cache = require("../cache");

function printToConsole({
	date,
	i,
	performanceOfRouteComp,
	inputToken,
	outputToken,
	tokenA,
	tokenB,
	route,
	simulatedProfit,
}) {
	try {
		if (cache.ui.allowClear) {
			// update max profitability spotted chart
			if (cache.ui.showProfitChart) {
				let spottetMaxTemp =
					cache.chart.spottedMax[cache.sideBuy ? "buy" : "sell"];
				spottetMaxTemp.shift();
				spottetMaxTemp.push(
					simulatedProfit === Infinity
						? 0
						: parseFloat(simulatedProfit.toFixed(2))
				);
				cache.chart.spottedMax.buy = spottetMaxTemp;
			}

			// update performance chart
			if (cache.ui.showPerformanceOfRouteCompChart) {
				let performanceTemp = cache.chart.performanceOfRouteComp;
				performanceTemp.shift();
				performanceTemp.push(parseInt(performanceOfRouteComp.toFixed()));
				cache.chart.performanceOfRouteComp = performanceTemp;
			}

			// check swap / fetch result status
			let statusMessage = " ";
			let statusPerformance;
			if (cache.swappingRightNow) {
				statusPerformance = performance.now() - cache.performanceOfTxStart;
				statusMessage = chalk.bold[
					statusPerformance < 45000
						? "greenBright"
						: statusPerformance < 60000
						? "yellowBright"
						: "redBright"
				](`SWAPPING ... ${(statusPerformance / 1000).toFixed(2)} s`);
			} else if (cache.fetchingResultsFromSolscan) {
				statusPerformance =
					performance.now() - cache.fetchingResultsFromSolscanStart;
				statusMessage = chalk.bold[
					statusPerformance < 45000
						? "greenBright"
						: statusPerformance < 90000
						? "yellowBright"
						: "redBright"
				](`FETCHING RESULT ... ${(statusPerformance / 1000).toFixed(2)} s`);
			}

			// refresh console before print
			console.clear();
			ui.resetOutput();

			// show HOTKEYS HELP
			if (cache.ui.showHelp) {
				ui.div(
					chalk.gray("[H] - show/hide help"),
					chalk.gray("[CTRL]+[C] - exit"),
					chalk.gray("[I] - incognito RPC")
				);
				ui.div(
					chalk.gray("[L] - show/hide latency chart"),
					chalk.gray("[P] - show/hide profit chart"),
					chalk.gray("[T] - show/hide trade history")
				);
				ui.div(
					chalk.gray("[E] - force execution"),
					chalk.gray("[R] - revert back swap"),
					chalk.gray("[S] - simulation mode switch")
				);
				ui.div(" ");
			}

			ui.div(
				{
					text: `TIMESTAMP: ${chalk[cache.ui.defaultColor](
						date.toLocaleString()
					)}`,
				},
				{
					text: `I: ${
						i % 2 === 0
							? chalk[cache.ui.defaultColor].bold(i)
							: chalk[cache.ui.defaultColor](i)
					} | ${chalk.bold[cache.ui.defaultColor](
						cache.iterationPerMinute.value
					)} i/min`,
				},
				{
					text: `RPC: ${chalk[cache.ui.defaultColor](
						cache.ui.hideRpc
							? `${cache.config.rpc[0].slice(
									0,
									5
							  )}...${cache.config.rpc[0].slice(-5)}`
							: cache.config.rpc[0]
					)}`,
				},
			);

			const performanceOfRouteCompColor =
				performanceOfRouteComp < 1000 ? cache.ui.defaultColor : "redBright";

			ui.div(
				{
					text: `STARTED: ${chalk[cache.ui.defaultColor](
						moment(cache.startTime).fromNow()
					)}`,
				},
				{
					text: `LOOKUP (ROUTE): ${chalk.bold[performanceOfRouteCompColor](
						performanceOfRouteComp.toFixed()
					)} ms`,
				},
				{
					text: `MIN INTERVAL: ${chalk[cache.ui.defaultColor](
						cache.config.minInterval
					)} ms QUEUE: ${chalk[cache.ui.defaultColor](
						Object.keys(cache.queue).length
					)}/${chalk[cache.ui.defaultColor](cache.queueThrottle)}`,
				}
			);

			ui.div(
				" ",
				" ",
				Object.values(cache.queue)
					.map(
						(v) => `${chalk[v === 0 ? "green" : v < 0 ? "yellow" : "red"]("●")}`
					)
					.join(" ")
			);

			if (cache.ui.showPerformanceOfRouteCompChart)
				ui.div(
					chart.plot(cache.chart.performanceOfRouteComp, {
						padding: " ".repeat(10),
						height: 5,
					})
				);

			// Show pubkey for identification of bot instance
			const pubkey = cache.ui.hideRpc ? 'hidden' : cache.walletpubkey;

			ui.div(`ARB PROTOCOL ${package.version} - (${pubkey})`);
			ui.div(chalk.gray("-".repeat(140)));

			ui.div(
				`${
					cache.tradingEnabled
						? "TRADING"
						: chalk.bold.magentaBright("SIMULATION")
				}: ${chalk.bold[cache.ui.defaultColor](inputToken.symbol)} ${
					cache.config.tradingStrategy === "arbitrage"
						? ""
						: `-> ${chalk.bold[cache.ui.defaultColor](outputToken.symbol)}`
				}`,
				`ROUTES: ${chalk.bold.yellowBright(
					cache.availableRoutes[cache.sideBuy ? "buy" : "sell"]
				)}`,
				`STRATEGY: ${chalk.bold[cache.ui.defaultColor](
					cache.config.tradingStrategy
				)}`,
				{
					text: statusMessage,
				}
			);
			ui.div("");

			ui.div("BUY", "SELL", " ", " ");

			ui.div(
				{
					text: `SUCCESS : ${chalk.bold.green(cache.tradeCounter.buy.success)}`,
				},
				{
					text: `SUCCESS: ${chalk.bold.green(cache.tradeCounter.sell.success)}`,
				},
				{
					text: " ",
				},
				{
					text: " ",
				}
			);
			ui.div(
				{
					text: `FAIL: ${chalk.bold.red(cache.tradeCounter.buy.fail)}`,
				},
				{
					text: `FAIL: ${chalk.bold.red(cache.tradeCounter.sell.fail)}`,
				},
				{
					text: " ",
				},
				{
					text: " ",
				}
			);
			ui.div("");

			ui.div(
				{
					text: `IN:  ${chalk.yellowBright(
						toDecimal(String(route.inAmount), inputToken.decimals)
					)} ${chalk[cache.ui.defaultColor](inputToken.symbol)}`,
				},
				{
					text: " ",
				},
				{
					text: `SLIPPAGE: ${chalk.magentaBright(
						`${
							cache.config.slippage + " BPS"
						}`
					)}`,
				},
				{
					text: " ",
				},
				{
					text: " ",
				}
			);

			ui.div(
				{
					text: `OUT: ${chalk[simulatedProfit > 0 ? "greenBright" : "red"](
						toDecimal(String(route.outAmount), outputToken.decimals)
					)} ${chalk[cache.ui.defaultColor](outputToken.symbol)}`,
				},
				{
					text: " ",
				},
				{
					text: `MIN. OUT: ${chalk.magentaBright(
						toDecimal(String(route.otherAmountThreshold), outputToken.decimals)
					)}`,
				},
				{
					text: `W/UNWRAP SOL: ${chalk[cache.ui.defaultColor](
						cache.wrapUnwrapSOL ? "on" : "off"
					)}`,
				},
				{
					text: " ",
				}
			);

			ui.div(
				{
					text: `PROFIT: ${chalk[simulatedProfit > 0 ? "greenBright" : "red"](
						simulatedProfit.toFixed(2)
					)} % ${chalk.gray(`(${cache?.config?.minPercProfit})`)}`,
				},
				{
					text: " ",
				},
				{
					text: " ",
				},
				{
					text: " ",
				},
				{
					text: " ",
				}
			);

			ui.div(" ");

			ui.div("CURRENT BALANCE", "LAST BALANCE", "INIT BALANCE", "PROFIT", " ");

			ui.div(
				`${chalk[JSBI.GT(cache.currentBalance.tokenA, 0) ? "yellowBright" : "gray"](
					toDecimal(cache.currentBalance.tokenA, tokenA.decimals)
				)} ${chalk[cache.ui.defaultColor](tokenA.symbol)}`,

				`${chalk[JSBI.GT(cache.lastBalance.tokenA, 0) ? "yellowBright" : "gray"](
					toDecimal(cache.lastBalance.tokenA, tokenA.decimals)
				)} ${chalk[cache.ui.defaultColor](tokenA.symbol)}`,

				`${chalk[JSBI.GT(cache.initialBalance.tokenA,0) ? "yellowBright" : "gray"](
					toDecimal(cache.initialBalance.tokenA, tokenA.decimals)
				)} ${chalk[cache.ui.defaultColor](tokenA.symbol)}`,

				`${chalk[JSBI.GT(cache.currentProfit.tokenA,0) ? "greenBright" : "redBright"](
					cache.currentProfit.tokenA.toFixed(2)
				)} %`,
				" "
			);

			ui.div(
				`${chalk[JSBI.GT(cache.currentBalance.tokenB,0) ? "yellowBright" : "gray"](
					toDecimal(String(cache.currentBalance.tokenB), tokenB.decimals)
				)} ${chalk[cache.ui.defaultColor](tokenB.symbol)}`,

				`${chalk[JSBI.GT(cache.lastBalance.tokenB,0) ? "yellowBright" : "gray"](
					toDecimal(String(cache.lastBalance.tokenB), tokenB.decimals)
				)} ${chalk[cache.ui.defaultColor](tokenB.symbol)}`,

				`${chalk[JSBI.GT(cache.initialBalance.tokenB,0) ? "yellowBright" : "gray"](
					toDecimal(String(cache.initialBalance.tokenB), tokenB.decimals)
				)} ${chalk[cache.ui.defaultColor](tokenB.symbol)}`,

				`${chalk[JSBI.GT(cache.currentProfit.tokenB,0) ? "greenBright" : "redBright"](
					cache.currentProfit.tokenB.toFixed(2)
				)} %`,
				" "
			);

			ui.div(chalk.gray("-".repeat(140)));
			ui.div("");

			if (cache.ui.showProfitChart) {
				ui.div(
					chart.plot(cache.chart.spottedMax[cache.sideBuy ? "buy" : "sell"], {
						padding: " ".repeat(10),
						height: 4,
						colors: [simulatedProfit > 0 ? chart.lightgreen : chart.lightred],
					})
				);

				ui.div("");
			}

			ui.div(
				{
					text: `MAX (BUY): ${chalk[cache.ui.defaultColor](
						cache.maxProfitSpotted.buy.toFixed(2)
					)} %`,
				},
				{
					text: `MAX (SELL): ${chalk[cache.ui.defaultColor](
						cache.maxProfitSpotted.sell.toFixed(2)
					)} %`,
				},
				{
					text: `ADAPTIVE SLIPPAGE: ${chalk[cache.ui.defaultColor](
						(cache.config.adaptiveSlippage==1) ? 'ON' : 'OFF'
					)}`,
				},
			);

			ui.div("");
			ui.div(chalk.gray("-".repeat(140)));
			ui.div("");

			if (cache.ui.showTradeHistory) {
				ui.div(
					{ text: `TIMESTAMP` },
					{ text: `SIDE` },
					{ text: `IN` },
					{ text: `OUT` },
					{ text: `PROFIT` },
					{ text: `EXP. OUT` },
					{ text: `EXP. PROFIT` },
					{ text: `ERROR` }
				);

				ui.div(" ");

				if (cache?.tradeHistory?.length > 0) {
					const tableData = [...cache.tradeHistory].slice(-5);
					tableData.map((entry) =>
						ui.div(
							{ text: `${entry.date}`, border: true },
							{ text: `${entry.buy ? "BUY" : "SELL"}`, border: true },
							{ text: `${entry.inAmount} ${entry.inputToken}`, border: true },
							{ text: `${entry.outAmount} ${entry.outputToken}`, border: true },
							{
								text: `${
									chalk[
										entry.profit > 0
											? "greenBright"
											: entry.profit < 0
											? "redBright"
											: "cyanBright"
									](isNaN(entry.profit) ? "0" : entry.profit.toFixed(2)) + " %"
								}`,
								border: true,
							},
							{
								text: `${entry.expectedOutAmount} ${entry.outputToken}`,
								border: true,
							},
							{
								text: `${entry.expectedProfit.toFixed(2)}% ${entry.slippage} BPS`,
								border: true,
							},
							{
								text: `${
									entry.error ? chalk.bold.redBright(entry.error) : "-"
								}`,
								border: true,
							}
						)
					);
				}
			}
			ui.div("");

			// print UI
			console.log(ui.toString());
		}
	} catch (error) {
		console.log(error);
	}
}

module.exports = printToConsole;
