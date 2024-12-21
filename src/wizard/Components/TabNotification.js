const React = require("react");
const { Box, Text } = require("ink");

const EscNotification = ({ skip = false }) => {
	if (skip)
		return (
			<Box paddingTop={1}>
				<Text color="cyanBright">
					Press <Text bold>TAB</Text> to use <Text>DEFAULT</Text> from .env
				</Text>
			</Box>
		);

	return (
		<Box paddingTop={1}>
			<Text color="greenBright">
				Press <Text bold>TAB</Text> wen done
			</Text>
		</Box>
	);
};

module.exports = EscNotification;
