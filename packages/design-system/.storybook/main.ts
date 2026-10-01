import { defineMain } from "@storybook/react-vite/node";

export default defineMain({
	framework: "@storybook/react-vite",
	stories: ["../src/**/*.stories.tsx"],
	core: {
		disableTelemetry: true,
	},
});
