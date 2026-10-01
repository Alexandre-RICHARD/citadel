import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";

import { defaultTheme } from "./defaultTheme";
import type { ThemeType } from "./theme.type";
import { ThemeProvider } from "./ThemeProvider";

const meta = {
	title: "Foundations/Theme",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const tokenNames = Object.keys(defaultTheme) as (keyof ThemeType)[];

const rowStyle: CSSProperties = {
	display: "grid",
	gridTemplateColumns: "26rem 22rem 1fr",
	alignItems: "center",
	gap: "var(--theme-spaceL)",
	padding: "var(--theme-spaceXS) 0",
	borderBottom: "1px solid var(--theme-colorBorderSoft)",
};

function TokenPreview({ tokenName }: { tokenName: keyof ThemeType }) {
	const value = `var(--theme-${tokenName})`;

	if (tokenName.startsWith("color"))
		return (
			<span
				style={{
					display: "block",
					width: "6rem",
					height: "2.4rem",
					borderRadius: "var(--theme-radiusS)",
					border: "1px solid var(--theme-colorBorder)",
					background: value,
				}}
			/>
		);
	if (tokenName.startsWith("fontFamily"))
		return <span style={{ fontFamily: value }}>Compteur de morts 0123</span>;
	if (tokenName.startsWith("fontSize"))
		return <span style={{ fontSize: value }}>Aa</span>;
	if (tokenName.startsWith("space"))
		return (
			<span
				style={{
					display: "block",
					width: value,
					height: "1.2rem",
					background: "var(--theme-colorPrimaryHue)",
				}}
			/>
		);
	return (
		<span
			style={{
				display: "block",
				width: "4rem",
				height: "4rem",
				borderRadius: value,
				background: "var(--theme-colorPrimaryHue)",
			}}
		/>
	);
}

export const Tokens: Story = {
	render: () => (
		<div style={{ color: "var(--theme-colorText)" }}>
			{tokenNames.map((tokenName) => (
				<div
					key={tokenName}
					style={rowStyle}
				>
					<code>--theme-{tokenName}</code>
					<code>{defaultTheme[tokenName]}</code>
					<TokenPreview tokenName={tokenName} />
				</div>
			))}
		</div>
	),
};

const cardStyle: CSSProperties = {
	padding: "var(--theme-spaceL)",
	borderRadius: "var(--theme-radiusM)",
	border: "1px solid var(--theme-colorBorder)",
	background: "var(--theme-colorSurface)",
	color: "var(--theme-colorText)",
};

export const LocalOverride: Story = {
	render: () => (
		<div style={{ display: "flex", gap: "var(--theme-spaceL)" }}>
			<div style={cardStyle}>Thème par défaut, hérité de la racine</div>
			<ThemeProvider
				theme={{
					colorSurface: "#17151a",
					colorBorder: "#2c2830",
					colorText: "#ece5d6",
				}}
				customVariables={{ "--highlight": "#ff7a3d" }}
			>
				<div style={cardStyle}>
					Surcharge locale de 3 tokens, et une variable créée :{" "}
					<strong style={{ color: "var(--highlight)" }}>--highlight</strong>
				</div>
			</ThemeProvider>
		</div>
	),
};
