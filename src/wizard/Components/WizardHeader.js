const React = require("react");
const BigText = require("ink-big-text");
const Gradient = require("ink-gradient");
const { Box } = require("ink");
const { useState, useEffect } = require("react");

let colorsSetInitialState = [
	"#cf4884",
	"#8832b3",
	"#b5b4fa",
	"#cdadff",
	"#6d29c5",
	"#4e21d9",
	"#481ede",
	"#4b9db0",
	"#8deef5",
	"#cdd4a2",
	"#e2a659",
];

const IntroTitle = () => {
	const [colorsSet, setColorSet] = useState(colorsSetInitialState);
	useEffect(() => {
		const changeColorInterval = setInterval(() => {
			const temp = [...colorsSet];
			const a = temp.shift();
			temp.push(a);
			setColorSet(temp);
		}, 200);

		return () => {
			try {
				clearInterval(changeColorInterval);
			} catch (error) {
				console.log("changeColorInterval error: ", error);
			}
		};
	}, [colorsSet]);

	return (
		<Box flexDirection="row">
			<Gradient colors={colorsSet.slice(0, 4)}>
				<BigText text={"ARB"} font="tiny"></BigText>
			</Gradient>
			<Gradient colors={colorsSet.slice(4, 8)}>
				<BigText text="Jupiter" font="tiny" lineHeight={1}></BigText>
			</Gradient>
			<Gradient colors={colorsSet.slice(8)}>
				<BigText text="Bot" font="tiny"></BigText>
			</Gradient>
		</Box>
	);
};

module.exports = IntroTitle;
