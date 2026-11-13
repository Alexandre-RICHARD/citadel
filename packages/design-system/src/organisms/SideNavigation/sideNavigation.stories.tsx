import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	BookOpen,
	Calculator,
	Castle,
	Database,
	Factory,
	House,
	LogIn,
	Settings,
	ShieldCheck,
	SlidersHorizontal,
	Sun,
	UserRound,
} from "lucide-react";
import { useState } from "react";
import { fn } from "storybook/test";

import { SideNavigation } from ".";
import type { SideNavigationEntry } from "./sideNavigationEntry.type";

const PROFILE_PAGES = [
	{ href: "/identite", label: "Identité", icon: UserRound },
	{ href: "/connexion", label: "Connexion", icon: LogIn },
	{ href: "/securite", label: "Sécurité", icon: ShieldCheck },
	{ href: "/donnees", label: "Mes données", icon: Database },
	{ href: "/preferences", label: "Préférences", icon: SlidersHorizontal },
];

const meta = {
	title: "Organisms/SideNavigation",
	component: SideNavigation,
	parameters: { layout: "fullscreen" },
	args: {
		label: "Profil",
		entries: [],
		onNavigate: fn(),
		storageKey: "storybook-side-navigation",
		children: null,
	},
} satisfies Meta<typeof SideNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

function Page({ title }: { title: string }) {
	return (
		<div style={{ display: "grid", gap: "1.6rem" }}>
			<h1 style={{ fontSize: "2.4rem" }}>{title}</h1>
			{Array.from({ length: 12 }, (_, index) => (
				<p key={index}>
					Un paragraphe de la page, pour voir le menu rester en place pendant le
					défilement.
				</p>
			))}
		</div>
	);
}

// Une colonne dans la page, dépliée par défaut, avec le pseudo en tête
export const Inline: Story = {
	render: (args) => {
		const [current, setCurrent] = useState(PROFILE_PAGES[0]?.href);
		const currentPage = PROFILE_PAGES.find(({ href }) => href === current);
		const entries: SideNavigationEntry[] = [
			{
				kind: "custom",
				id: "user",
				render: (isWide) => (
					<p style={{ padding: "0.8rem 1rem", fontWeight: 600 }}>
						{isWide ? "Alex · @alex" : "A"}
					</p>
				),
			},
			...PROFILE_PAGES.map(({ href, label, icon }) => ({
				kind: "link" as const,
				id: href,
				href,
				label,
				icon,
				isActive: href === current,
			})),
		];

		return (
			<div style={{ padding: "2.4rem", maxWidth: "100rem" }}>
				<SideNavigation
					label={args.label}
					storageKey={args.storageKey}
					entries={entries}
					compactBar={<strong>{currentPage?.label}</strong>}
					onNavigate={(href) => {
						args.onNavigate(href);
						setCurrent(href);
					}}
				>
					<Page title={currentPage?.label ?? ""} />
				</SideNavigation>
			</div>
		);
	},
};

// Collé au bord de la fenêtre, en groupes : les réglages descendent en bas grâce à l'espaceur
export const ViewportEdge: Story = {
	args: {
		label: "Satisfactory",
		storageKey: "storybook-side-navigation-edge",
	},
	render: (args) => {
		const [current, setCurrent] = useState("/");
		const entries: SideNavigationEntry[] = [
			{
				kind: "custom",
				id: "logo",
				render: () => (
					<div
						style={{
							display: "grid",
							placeItems: "center",
							width: "40px",
							height: "48px",
						}}
					>
						<Factory size={24} />
					</div>
				),
			},
			{
				kind: "group",
				id: "pages",
				label: "Outils",
				items: [
					{ href: "/", label: "Accueil", icon: House },
					{ href: "/recipes", label: "Recettes", icon: BookOpen },
					{ href: "/calculator", label: "Calculateur", icon: Calculator },
				].map(({ href, label, icon }) => ({
					kind: "link" as const,
					id: href,
					href,
					label,
					icon,
					isActive: href === current,
				})),
			},
			{ kind: "spacer", id: "spacer" },
			{
				kind: "group",
				id: "settings",
				items: [
					{
						kind: "link",
						id: "settings",
						href: "/settings",
						label: "Réglages",
						icon: Settings,
						isActive: current === "/settings",
					},
					{
						kind: "action",
						id: "theme",
						label: "Thème sombre",
						icon: Sun,
						onClick: fn(),
					},
					{
						kind: "link",
						id: "citadel",
						href: "/homepage",
						label: "La Citadel",
						icon: Castle,
					},
				],
			},
		];

		return (
			<SideNavigation
				label={args.label}
				storageKey={args.storageKey}
				placement="viewportEdge"
				isExpandedByDefault={false}
				entries={entries}
				onNavigate={(href) => {
					args.onNavigate(href);
					setCurrent(href);
				}}
			>
				<div style={{ padding: "2.4rem" }}>
					<Page title="Satisfactory" />
				</div>
			</SideNavigation>
		);
	},
};
