const CONFIG_INITIAL_STATE = {
	showHelp: true,
	nav: {
		currentStep: 0,
		steps: [
			"network",
			"rpc",
			"strategy",
			"tokens",
			"trading size",
			"profit",
			"slippage",
			"priority",
			"advanced",
			"confirm",
		],
	},
	config: {
		network: {
			value: "",
			isSet: false,
		},
		rpc: {
			value: [],
			isSet: false,
			state: {
				items: [
					{
						label: process.env.DEFAULT_RPC,
						value: process.env.DEFAULT_RPC,
						isSelected: true,
					},
					...String(process.env.ALT_RPC_LIST)
						.split(",")
						.map((item) => ({
							label: item,
							value: item,
							isSelected: false,
						})),
				],
			},
		},
		strategy: {
			value: "",
			isSet: false,
		},
		tokens: {
			value: {
				tokenA: { symbol: "", address: "" },
				tokenB: { symbol: "", address: "" },
			},
			isSet: {
				tokenA: false,
				tokenB: false,
			},
		},
		"trading size": {
			value: {
				strategy: "",
				value: "",
			},
			isSet: false,
		},
		profit: {
			value: 1,
			isSet: {
				percent: false,
				strategy: false,
			},
		},
		slippage: {
			value: 0,
			isSet: false,
		},
		priority: {
			value: 0,
			isSet: false,
		},
		advanced: {
			value: {
				minInterval: 100,
			},
			isSet: {
				minInterval: false,
			},
		},
	},
};

module.exports = {
	DISCORD_INVITE_URL: "https://discord.gg/Z8JJCuq4",
	CONFIG_INITIAL_STATE,
};
