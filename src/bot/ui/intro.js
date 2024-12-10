const ui = require("cliui")({ width: 140 });
const chalk = require("chalk");
const gradient = require("gradient-string");

const package = require("../../../package.json");
const { DISCORD_INVITE_URL } = require("../../constants");

const universeSize = 15;
const color = "white";
const startWarp = 30;
let colorsSet = [
	"#cf4884",
	"#8832b3",
	"#b5b4fa",
	"#cdadff",
	"#6d29c5",
	"#4e21d9",
	"#481ede",
];

const random = (h = 100, l = 1) => Math.floor(Math.random() * (h - l + 1)) + l;

async function intro() {
	try {
		const skipIntro = process.env.SKIP_INTRO === "true" || false;

		if (!skipIntro) {
			ui.div(" ");
			for (let i = 0; i < 200; i++) {
				const speed = i > 50 ? 100 - i : i;
				const a = colorsSet.shift();
				colorsSet.push(a);
				const g = gradient(colorsSet);

				const char =
					i > startWarp
						? i > 180
							? g("/").repeat(random(i / 10, i / 10 - 2))
							: "-".repeat(random(i / 10, i / 10 - 2))
						: "•";
				await new Promise((resolve) => setTimeout(resolve, speed));

				console.clear();
				ui.resetOutput();

				for (let ii = 0; ii < universeSize; ii++) {
					ui.div({
						text: `${chalk[color](char)}`,
						padding: [0, 0, 0, random()],
					});
				}

				const consoleWidth = process.stdout.columns || 140;
				const text = `SOLANA ARBITRAGE BOT - ${package.version}`;
				const padding = Math.max(0, Math.floor((consoleWidth - text.length) / 2));

				ui.div(
					{
						text: g(text),
						width: consoleWidth,
						align: "center",
						padding: [1, 0, 1, padding],
					}
				);

				for (let ii = 0; ii < universeSize; ii++) {
					ui.div({
						text: `${chalk[color](char)}`,
						padding: [0, 0, 0, random()],
					});
				}

				console.log(ui.toString());
			}
			ui.div("");
			console.clear();
		}
	} catch (error) {
		console.log(error);
	}
}

module.exports = intro;