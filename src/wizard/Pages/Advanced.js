const React = require("react");
const { Box, Text } = require("ink");
const { useContext, useState, useRef, useEffect } = require("react");
const WizardContext = require("../WizardContext");
const { default: TextInput } = require("ink-text-input");

function Advanced() {
	let isMountedRef = useRef(false);

	const {
		config: {
			advanced: { value: advancedValue, isSet: advancedIsSet },
		},
		configSetValue,
	} = useContext(WizardContext);

	const [tempAdvancedValue, setTempAdvancedValue] = useState(advancedValue);

	const handleSubmit = (key, value) => {
		configSetValue("advanced", {
			value: {
				...advancedValue,
				[key]: value,
			},
			isSet: {
				...advancedIsSet,
				[key]: true,
			},
		});
	};

	const handleMinIntervalChange = (value) => {
		if (!isMountedRef.current) return;

		setTempAdvancedValue({
			...tempAdvancedValue,
			minInterval: value,
		});
	};

	useEffect(() => {
		isMountedRef.current = true;
		return () => (isMountedRef.current = false);
	}, []);

	return (
		<Box flexDirection="column">
			<Text color="gray">
				Advanced settings can be crucial for strategy efficiency.
			</Text>
			<Text color="gray">
				Please make sure you know what you are doing before changing these
				settings.
			</Text>
			<Box flexDirection="row" marginTop={1}>
				<Text>
					Min Interval:{" "}
					{!advancedIsSet.minInterval ? (
						<Text color="yellowBright">
							<TextInput
								value={
									tempAdvancedValue?.minInterval
										? tempAdvancedValue.minInterval.toString()
										: ""
								}
								onChange={handleMinIntervalChange}
								onSubmit={(value) => {
									handleSubmit("minInterval", value);
								}}
							/>
						</Text>
					) : (
						<Text color="greenBright">{tempAdvancedValue?.minInterval}</Text>
					)}
				</Text>
			</Box>
		</Box>
	);
}
module.exports = Advanced;
