import "../src/styles/reset.scss";
import "../src/styles/global.scss";

import type { Preview } from "@storybook/react-vite";

import { defaultTheme } from "../src/theme/defaultTheme";
import { ThemeProvider } from "../src/theme/ThemeProvider";

const preview: Preview = {
	decorators: [
		(Story) => (
			<ThemeProvider theme={defaultTheme}>
				<Story />
			</ThemeProvider>
		),
	],
};

export default preview;
