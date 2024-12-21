const React = require("react");
const { Box } = require("ink");

const importJsx = require("import-jsx");
const { useContext } = require("react");
const WizardContext = require("../WizardContext");
const Help = require("import-jsx")("./Help");

const WizardHeader = importJsx("./WizardHeader");
const Menu = importJsx("./Menu");
const Main = importJsx("./Main");

const Layout = () => {
	const { showHelp } = useContext(WizardContext);
	return (
		<>
			{showHelp && <Help />}
			<Box padding={1} justifyContent="flex-start" flexDirection="row">
				<Menu />
				<Box
					width={80}
					minHeight={20}
					borderColor="#481fde"
					borderStyle="bold"
					padding={1}
					flexDirection="column"
				>
					<WizardHeader />
					<Main />
				</Box>
			</Box>
		</>
	);
};

module.exports = Layout;
