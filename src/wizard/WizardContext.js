const { createContext } = require("react");
const { initialState } = require("./reducer");

const WizardContext = createContext(initialState);

module.exports = WizardContext;
