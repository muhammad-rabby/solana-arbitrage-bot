const React = require("react");
const { Box, Text } = require("ink");

const EscNotification = () => {
	return (
		<Box paddingTop={1}>
			<Text dimColor color="yellow">
				Use <Text bold>ESC</Text> key if U wanna exit
			</Text>
		</Box>
	);
};

module.exports = EscNotification;
