const { Box, Text } = require("ink");
const { useContext } = require("react");
const React = require("react");
const WizardContext = require("../WizardContext");
const Menu = () => {
	const { nav, config } = useContext(WizardContext);
	return (
		<Box
			width="10%"
			minWidth={12}
			flexDirection="column"
			justifyContent="center"
			alignItems="flex-end"
		>
			{nav.steps.map((step, index) => {
				const isActive = index === nav.currentStep;
				const isSet = config[nav.steps[index]]?.isSet;
				const isSectionSet =
					isSet instanceof Object
						? Object.values(isSet).every((value) => value === true)
						: isSet;

				return (
					<Text
						color={isSectionSet ? "green" : ""}
						dimColor={!isActive}
						bold={isActive}
						underline={isActive}
						backgroundColor={isActive && "#481fde"}
						key={index}
					>
						{step}
					</Text>
				);
			})}
		</Box>
	);
};

module.exports = Menu;
