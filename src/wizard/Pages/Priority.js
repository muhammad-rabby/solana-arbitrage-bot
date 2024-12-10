const React = require("react");
const { Box, Text } = require("ink");
const { default: SelectInput } = require("ink-select-input");
const { useContext, useState, useEffect, useRef } = require("react");
const WizardContext = require("../WizardContext");

const { default: TextInput } = require("ink-text-input");
const chalk = require("chalk");

const priority_STRATEGIES = [
	{ label: "1000 micro Lamports", value: 1000 },
	{ label: "10000 micro Lamports", value: 10000 },
	{ label: "50000 micro Lamports", value: 50000 },
	{ label: "Custom setting", value: "custom" },
];

const Indicator = ({ label, value }) => {
	const {
		config: {
			priority: { value: selectedValue },
		},
	} = useContext(WizardContext);

	const isSelected = value == selectedValue;

	return <Text>{chalk[isSelected ? "greenBright" : "white"](`${label}`)}</Text>;
};

function priority() {
	const { configSetValue } = useContext(WizardContext);
	let isMountedRef = useRef(false);

	const [temppriorityStrategy, setTemppriorityStrategy] = useState(
		priority_STRATEGIES[0]
	);
	const [custompriority, setCustompriority] = useState("1");
	const [inputBorderColor, setInputBorderColor] = useState("gray");

	const handlepriorityStrategySelect = (priority) => {
		const value = priority.value;
		setTemppriorityStrategy(value);
		if (value !== "custom")
			configSetValue(
				"priority", Number(value)
			);
	};

	const handleCustompriorityChange = (value) => {
		const badChars = /[^0-9.]/g;
		badChars.test(value)
			? setInputBorderColor("red")
			: setInputBorderColor("gray");
		const sanitizedValue = value.replace(badChars, "");
		setCustompriority(sanitizedValue);
		setTimeout(() => isMountedRef.current && setInputBorderColor("gray"), 100);
	};

	const handleCustomprioritySubmit = () => {
		configSetValue("priority", Number(custompriority));
	};

	useEffect(() => {
		isMountedRef.current = true;
		return () => (isMountedRef.current = false);
	}, []);

	return (
		<Box flexDirection="column">
			<Text>
				Set <Text color="#cdadff">priority</Text> strategy
			</Text>
			<Box margin={1}>
				<SelectInput
					items={priority_STRATEGIES}
					itemComponent={Indicator}
					onSelect={handlepriorityStrategySelect}
				/>
			</Box>
			{temppriorityStrategy === "custom" && (
				<Box flexDirection="row" alignItems="center">
					<Text>Custom priority:</Text>
					<Box
						borderStyle="round"
						borderColor={inputBorderColor}
						marginLeft={1}
					>
						<TextInput
							value={custompriority}
							onChange={handleCustompriorityChange}
							onSubmit={handleCustomprioritySubmit}
						/>
					</Box>
					<Text>micro Lamports</Text>
				</Box>
			)}
		</Box>
	);
}
module.exports = priority;
