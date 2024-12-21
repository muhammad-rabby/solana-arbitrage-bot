const React = require("react");
const { Box, Text } = require("ink");
const { useContext, useState, useRef, useEffect } = require("react");
const WizardContext = require("../WizardContext");
const { default: TextInput } = require("ink-text-input");
const chalk = require("chalk");
const { default: SelectInput } = require("ink-select-input");

const TRADING_SIZE_STRATEGIES = [
	{ label: "cumulative", value: "cumulative" },
	{ label: "fixed", value: "fixed" },
];

const Indicator = ({ label, value }) => {
	const {
		config: {
			"trading size": { value: selectedValue },
		},
	} = useContext(WizardContext);

	const isSelected = value === selectedValue.strategy;

	return <Text>{chalk[isSelected ? "greenBright" : "white"](`${label}`)}</Text>;
};

function TradingSize() {
	let isMountedRef = useRef(false);

	const {
		config: {
			tokens: { value: tokensValue },
			"trading size": { value: tradingSizeValue },
		},
		configSetValue,
	} = useContext(WizardContext);

	const [tradingSize, setTradingSize] = useState(tradingSizeValue.value);
	const [inputBorderColor, setInputBorderColor] = useState("gray");

	const handleTradingSizeStrategySelect = (selected) => {
		configSetValue("trading size", {
			value: {
				strategy: selected.value,
				value: tradingSize,
			},
		});
	};

	const handleTradingSizeChange = (value) => {
		if (!isMountedRef.current) return;

		const badChars = /[^0-9.]/g;
		badChars.test(value)
			? setInputBorderColor("red")
			: setInputBorderColor("gray");
		const sanitizedValue = value.replace(badChars, "");
		setTimeout(() => isMountedRef.current && setInputBorderColor("gray"), 100);
		setTradingSize(sanitizedValue);
	};

	useEffect(() => {
		isMountedRef.current = true;
		return () => (isMountedRef.current = false);
	}, []);

	return (
		<Box flexDirection="column">
			<Text>
				Set <Text color="#cdadff">trading size</Text> strategy:
			</Text>
			<Box margin={1}>
				<SelectInput
					items={TRADING_SIZE_STRATEGIES}
					onSelect={handleTradingSizeStrategySelect}
					itemComponent={Indicator}
				/>
			</Box>
			<Box flexDirection="row" alignItems="center">
				<Text>Trading Size:</Text>
				<Box borderStyle="round" borderColor={inputBorderColor} marginLeft={1}>
					<TextInput
						value={tradingSize || ""}
						placeholder="0.0"
						onChange={handleTradingSizeChange}
						// onSubmit={(value) => handleSubmit("percent", value)}
					/>
					<Text color="gray"> {tokensValue.tokenA.symbol}</Text>
				</Box>
			</Box>
		</Box>
	);
}
module.exports = TradingSize;
