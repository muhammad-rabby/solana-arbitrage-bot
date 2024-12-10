// global cache
const cache = {
	startTime: new Date(),
	queue: {},
	queueThrottle: 1,
	sideBuy: true,
	iteration: 0,
	walletpubkey: '',
	walletpubkeyfull: '',
	iterationPerMinute: {
		start: performance.now(),
		value: 0,
		counter: 0,
	},
	initialBalance: {
		tokenA: 0,
		tokenB: 0,
	},

	currentBalance: {
		tokenA: 0,
		tokenB: 0,
	},
	currentProfit: {
		tokenA: 0,
		tokenB: 0,
	},
	lastBalance: {
		tokenA: 0,
		tokenB: 0,
	},
	profit: {
		tokenA: 0,
		tokenB: 0,
	},
	maxProfitSpotted: {
		buy: 0,
		sell: 0,
	},
	tradeCounter: {
		buy: { success: 0, fail: 0 },
		sell: { success: 0, fail: 0 },
		failedbalancecheck: 0,
		errorcount: 0,
	},
	ui: {
		defaultColor: process.env.UI_COLOR ?? "cyan",
		showPerformanceOfRouteCompChart: false,
		showProfitChart: false,
		showTradeHistory: false,
		hideRpc: false,
		showHelp: false,
		allowClear: true,
	},
	chart: {
		spottedMax: {
			buy: new Array(120).fill(0),
			sell: new Array(120).fill(0),
		},
		performanceOfRouteComp: new Array(120).fill(0),
	},
	hotkeys: {
		e: false,
		r: false,
	},
	tradingEnabled:
		process.env.TRADING_ENABLED === undefined
			? true
			: process.env.TRADING_ENABLED === "true",
	wrapUnwrapSOL:
		process.env.WRAP_UNWRAP_SOL === undefined
			? true
			: process.env.WRAP_UNWRAP_SOL === "true",
	swappingRightNow: false,
	fetchingResultsFromSolscan: false,
	fetchingResultsFromSolscanStart: 0,
	tradeHistory: [],
	performanceOfTxStart: 0,
	availableRoutes: {
		buy: 0,
		sell: 0,
	},
	isSetupDone: false,
};

module.exports = cache;
