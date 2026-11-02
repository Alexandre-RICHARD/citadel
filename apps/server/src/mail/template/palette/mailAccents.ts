import { MailAccentEnum } from "../mailAccent.enum.ts";
import type { MailAccentColors } from "./mailAccentColors.type.ts";

export const MAIL_ACCENTS: Record<MailAccentEnum, MailAccentColors> = {
	[MailAccentEnum.MAGENTA]: {
		hue: "#c0137f",
		strong: "#8f0d5e",
		subtle: "#fbe8f3",
		border: "#f3c2df",
		glow: "#f107a3",
		dark: {
			hue: "#ff5bd1",
			content: "#1a0016",
			subtle: "#3b1a43",
			border: "#5c2a62",
		},
	},
	[MailAccentEnum.VIOLET]: {
		hue: "#6b3fd4",
		strong: "#4c26a8",
		subtle: "#f0eafd",
		border: "#d9cdf8",
		glow: "#9b6bff",
		dark: {
			hue: "#b394ff",
			content: "#140a2e",
			subtle: "#2d2457",
			border: "#4a3d86",
		},
	},
	[MailAccentEnum.ORANGE]: {
		hue: "#c2410c",
		strong: "#9a3412",
		subtle: "#fdf0e7",
		border: "#f7cfb3",
		glow: "#ff7a45",
		dark: {
			hue: "#ffa06b",
			content: "#2a1000",
			subtle: "#3a2433",
			border: "#6a3a35",
		},
	},
	[MailAccentEnum.RED]: {
		hue: "#c81e3a",
		strong: "#9f1239",
		subtle: "#fdeaee",
		border: "#f6c3cd",
		glow: "#ff3b5c",
		dark: {
			hue: "#ff7b8f",
			content: "#2a0008",
			subtle: "#3b1a32",
			border: "#6b2c45",
		},
	},
};
