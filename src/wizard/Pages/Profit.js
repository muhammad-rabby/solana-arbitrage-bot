const React = require("react");
const { Box, Text } = require("ink");
const { useContext, useState, useRef, useEffect } = require("react");
const WizardContext = require("../WizardContext");

const { default: TextInput } = require("ink-text-input");

function MinProfit() {
	let isMountedRef = useRef(false);
	const {
		config: {
			profit: { value: profitValue },
		},
		configSetValue,
	} = useContext(WizardContext);

	const [minProfit, setMinProfit] = useState(profitValue.toString());
	const [inputBorderColor, setInputBorderColor] = useState("gray");

	const handleMinProfitSubmit = (value) => {
		configSetValue("profit", value);
	};

	const handleMinProfitChange = (value) => {
		if (!isMountedRef.current) return;

		const badChars = /[^0-9.]/g;
		badChars.test(value)
			? setInputBorderColor("red")
			: setInputBorderColor("gray");
		const sanitizedValue = value.replace(badChars, "");
		setMinProfit(sanitizedValue);
		setTimeout(() => isMountedRef.current && setInputBorderColor("gray"), 100);
	};

	useEffect(() => {
		isMountedRef.current = true;
		return () => (isMountedRef.current = false);
	}, []);

	return (
		<Box flexDirection="column">
			<Text>
				Set <Text color="#cdadff">min. profit</Text> value:
			</Text>

			<Box flexDirection="row" alignItems="center">
				<Text>Min. Profit:</Text>
				<Box borderStyle="round" borderColor={inputBorderColor} marginLeft={1}>
					<TextInput
						value={minProfit}
						onChange={handleMinProfitChange}
						onSubmit={handleMinProfitSubmit}
					/>
				</Box>
				<Text>%</Text>
			</Box>
		</Box>
	);
}
module.exports = MinProfit;
