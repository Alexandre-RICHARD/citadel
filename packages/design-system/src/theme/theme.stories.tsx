import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";

import { ColorSchemeEnum } from "./colorScheme/colorScheme.enum";
import { defaultTheme } from "./defaultTheme";
import { angersIrigoTheme } from "./projectThemes/angersIrigoTheme";
import { backlogTheme } from "./projectThemes/backlogTheme";
import { citadelTheme } from "./projectThemes/citadelTheme";
import { gameDeathCounterTheme } from "./projectThemes/gameDeathCounterTheme";
import { satisfactoryTheme } from "./projectThemes/satisfactoryTheme";
import { resolveTheme } from "./resolveTheme";
import type { ThemeType } from "./theme.type";
import type { ThemeDefinitionType } from "./themeDefinition.type";
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
	if (tokenName.endsWith("Display"))
		return (
			<span
				style={{
					fontFamily: "var(--theme-fontFamilySecondary)",
					fontWeight: "var(--theme-fontWeightDisplay)",
					letterSpacing: "var(--theme-letterSpacingDisplay)",
					textTransform: "var(--theme-textTransformDisplay)" as "none",
				}}
			>
				Titre 0123
			</span>
		);
	if (tokenName === "cornerCut")
		return (
			<span
				style={{
					display: "block",
					width: "4rem",
					height: "4rem",
					background: "var(--theme-colorPrimaryHue)",
					clipPath: `polygon(${value} 0, 100% 0, 100% calc(100% - ${value}), calc(100% - ${value}) 100%, 0 100%, 0 ${value})`,
				}}
			/>
		);
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

const projectThemes: [string, ThemeDefinitionType][] = [
	["Citadel", citadelTheme],
	["Game Death Counter", gameDeathCounterTheme],
	["Backlog", backlogTheme],
	["Angers Irigo", angersIrigoTheme],
	["Satisfactory", satisfactoryTheme],
];

const decorationTokens = [
	"colorDecoration1",
	"colorDecoration2",
	"colorDecoration3",
	"colorDecoration4",
] as const;

function ProjectThemeCard({ name }: { name: string }) {
	return (
		<div
			style={{
				display: "grid",
				gap: "var(--theme-spaceS)",
				padding: "var(--theme-spaceL)",
				borderRadius: "min(var(--theme-radiusL), 2.4rem)",
				border: "1px solid var(--theme-colorBorder)",
				background: "var(--theme-colorBackground)",
				color: "var(--theme-colorText)",
				fontFamily: "var(--theme-fontFamilyPrimary)",
			}}
		>
			<strong
				style={{
					fontFamily: "var(--theme-fontFamilySecondary)",
					fontWeight: "var(--theme-fontWeightDisplay)",
					letterSpacing: "var(--theme-letterSpacingDisplay)",
					textTransform: "var(--theme-textTransformDisplay)" as "none",
					fontSize: "var(--theme-fontSizeL)",
				}}
			>
				{name}
			</strong>
			<span style={{ color: "var(--theme-colorTextMuted)" }}>
				Texte secondaire, sur le fond du thème
			</span>
			<span
				style={{
					justifySelf: "start",
					padding: "var(--theme-spaceXS) var(--theme-spaceM)",
					borderRadius: "min(var(--theme-radiusL), 999px)",
					background: "var(--theme-colorPrimaryHue)",
					color: "var(--theme-colorPrimaryContent)",
				}}
			>
				Action principale
			</span>
			<div style={{ display: "flex", gap: "var(--theme-spaceXS)" }}>
				{decorationTokens.map((tokenName) => (
					<span
						key={tokenName}
						style={{
							width: "2.4rem",
							height: "2.4rem",
							borderRadius: "50%",
							background: `var(--theme-${tokenName})`,
						}}
					/>
				))}
			</div>
		</div>
	);
}

// Chaque thème de projet, en clair et en sombre : le même registre sert aux projets et à la homepage
export const ProjectThemes: Story = {
	render: () => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(2, minmax(0, 32rem))",
				gap: "var(--theme-spaceL)",
			}}
		>
			{projectThemes.map(([name, definition]) =>
				Object.values(ColorSchemeEnum).map((colorScheme) => (
					<ThemeProvider
						key={`${name}-${colorScheme}`}
						theme={resolveTheme(definition, colorScheme)}
					>
						<link
							rel="stylesheet"
							href={definition.fontStylesheet}
							precedence="default"
						/>
						<ProjectThemeCard
							name={`${name} · ${colorScheme === ColorSchemeEnum.Dark ? "sombre" : "clair"}`}
						/>
					</ThemeProvider>
				)),
			)}
		</div>
	),
};
