const React = require("react");
const { Box, Text } = require("ink");
const { default: SelectInput } = require("ink-select-input");
const { useContext, useState, useEffect, useRef } = require("react");
const WizardContext = require("../WizardContext");

const { default: TextInput } = require("ink-text-input");
const chalk = require("chalk");

const SLIPPAGE_STRATEGIES = [
	{ label: "1 BPS", value: 1 },
	{ label: "10 BPS", value: 10 },
	{ label: "30 BPS", value: 30 },
	{ label: "Custom BPS", value: "custom" },
];

const Indicator = ({ label, value }) => {
	const {
		config: {
			slippage: { value: selectedValue },
		},
	} = useContext(WizardContext);

	const isSelected = value == selectedValue;

	return <Text>{chalk[isSelected ? "greenBright" : "white"](`${label}`)}</Text>;
};

function Slippage() {
	const { configSetValue } = useContext(WizardContext);
	let isMountedRef = useRef(false);

	const [tempSlippageStrategy, setTempSlippageStrategy] = useState(
		SLIPPAGE_STRATEGIES[0]
	);
	const [customSlippage, setCustomSlippage] = useState("1");
	const [inputBorderColor, setInputBorderColor] = useState("gray");

	const handleSlippageStrategySelect = (slippage) => {
		const value = slippage.value;
		setTempSlippageStrategy(value);
		if (value !== "custom")
			configSetValue(
				"slippage", Number(value)
			);
	};

	const handleCustomSlippageChange = (value) => {
		const badChars = /[^0-9.]/g;
		badChars.test(value)
			? setInputBorderColor("red")
			: setInputBorderColor("gray");
		const sanitizedValue = value.replace(badChars, "");
		setCustomSlippage(sanitizedValue);
		setTimeout(() => isMountedRef.current && setInputBorderColor("gray"), 100);
	};

	const handleCustomSlippageSubmit = () => {
		configSetValue("slippage", Number(customSlippage));
	};

	useEffect(() => {
		isMountedRef.current = true;
		return () => (isMountedRef.current = false);
	}, []);

	return (
		<Box flexDirection="column">
			<Text>
				Set <Text color="#cdadff">slippage</Text> strategy
			</Text>
			<Box margin={1}>
				<SelectInput
					items={SLIPPAGE_STRATEGIES}
					itemComponent={Indicator}
					onSelect={handleSlippageStrategySelect}
				/>
			</Box>
			{tempSlippageStrategy === "custom" && (
				<Box flexDirection="row" alignItems="center">
					<Text>Custom slippage:</Text>
					<Box
						borderStyle="round"
						borderColor={inputBorderColor}
						marginLeft={1}
					>
						<TextInput
							value={customSlippage}
							onChange={handleCustomSlippageChange}
							onSubmit={handleCustomSlippageSubmit}
						/>
					</Box>
					<Text>BPS</Text>
				</Box>
			)}
		</Box>
	);
}
module.exports = Slippage;
