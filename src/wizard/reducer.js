const reducer = (prevState, action) => {
	const nav = prevState.nav;
	const isSet =
		action.value?.isSet instanceof Object ? action.value?.isSet : true;
	const value = action.value?.value || action.value;
	switch (action.type) {
		case "NEXT_STEP":
			return {
				...prevState,
				nav: {
					...prevState.nav,
					currentStep:
						nav.currentStep === nav.steps.length - 1 ? 0 : nav.currentStep + 1,
				},
			};
		case "PREV_STEP":
			return {
				...prevState,
				nav: {
					...prevState.nav,
					currentStep:
						nav.currentStep === 0 ? nav.steps.length - 1 : nav.currentStep - 1,
				},
			};
		case "TOGGLE_HELP":
			return {
				...prevState,
				showHelp: !prevState.showHelp,
			};
		case "CONFIG_SET":
			return {
				...prevState,
				config: {
					...prevState.config,
					[action.key]: {
						...prevState.config[action.key],
						value: value,
						isSet: isSet,
					},
				},
			};

		case "CONFIG_SWITCH_STATE":
			return {
				...prevState,
				config: {
					...prevState.config,
					[action.key]: {
						state: {
							...prevState.config[action.key].state,
							items: prevState.config[action.key].state.items.map((item) =>
								item.value === action.value
									? {
											...item,
											isSelected: !item.isSelected,
									  }
									: item
							),
						},
						isSet: isSet,
					},
				},
			};

		default:
			throw new Error(`Unhandled action type: ${action.type}`);
	}
};

module.exports = reducer;
