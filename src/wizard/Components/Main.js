const React = require("react");
const { Box } = require("ink");
const WizardContext = require("../WizardContext");
const { useContext } = require("react");
const importJsx = require("import-jsx");
const Divider = require("ink-divider");
const Router = importJsx("./Router");

function Main() {
	const { nav } = useContext(WizardContext);
	return (
		<Box flexDirection="column">
			<Divider title={nav.steps[nav.currentStep]} />
			<Box marginY={1}>
				<Router />
			</Box>
		</Box>
	);
}
module.exports = Main;
