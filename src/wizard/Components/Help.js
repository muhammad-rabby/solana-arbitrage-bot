const React = require("react");
const { Box, Text } = require("ink");
const chalk = require("chalk");
const Help = () => {
	return (
		<Box flexDirection="row" justifyContent="space-between" width={118}>
			<Box width={20} />
			<Box width={80} justifyContent="space-around">
				<Text>{chalk.gray`${chalk.bold.white("[")} previous`}</Text>
				<Text>{chalk.gray`${chalk.bold.white("]")} next`}</Text>
				<Text>{chalk.gray`[${chalk.bold.white("H")}]elp`}</Text>
				<Text>{chalk.gray`[${chalk.bold.hex("#481ede")("ESC")}]`}</Text>
			</Box>
		</Box>
	);
};
module.exports = Help;
