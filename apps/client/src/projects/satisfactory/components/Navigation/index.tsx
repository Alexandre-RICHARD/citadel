import { SideNavigation } from "@citadel/design-system/src/organisms/SideNavigation";
import type { SideNavigationEntry } from "@citadel/design-system/src/organisms/SideNavigation/sideNavigationEntry.type";
import { ColorSchemeEnum } from "@citadel/design-system/src/theme/colorScheme/colorScheme.enum";
import { Castle, Moon, Settings, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { buildReturnToHomepagePath } from "../../../../react/appNavigation/buildReturnToHomepagePath";
import { ProjectsEnum } from "../../../../react/appNavigation/projects.enum";
import { useProjectColorScheme } from "../../../../react/projectTheme/useProjectColorScheme";
import styles from "./navigation.module.scss";
import { SATISFACTORY_PAGES } from "./satisfactoryPages";

// Où ce navigateur retient si le menu de Satisfactory est déplié
const NAVIGATION_STORAGE_KEY = "citadel:satisfactory:navigation";
const SETTINGS_PATH = "/satisfactory/settings";

type Props = {
	children: ReactNode;
};

function SatisfactoryLogo() {
	return (
		<Link
			to="/satisfactory"
			className={styles.logo}
			aria-label="Satisfactory, accueil"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 1438.88 1819.54"
				aria-hidden
			>
				<polygon points="925.79 318.48 830.56 0 183.51 1384.12 510.41 1178.46 925.79 318.48" />
				<polygon points="1438.88 1663.28 1126.35 948.08 111.98 1586.26 0 1819.54 1020.91 1250.57 1123.78 1471.02 783.64 1663.28 1438.88 1663.28" />
			</svg>
		</Link>
	);
}

// Le menu de Satisfactory, collé au bord gauche : le logo, les outils en haut ; les réglages, le thème et le retour à la
// Citadel en bas
export function Navigation({ children }: Props) {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { colorScheme, toggleColorScheme } = useProjectColorScheme(
		ProjectsEnum.Satisfactory,
	);
	const isDark = colorScheme === ColorSchemeEnum.Dark;

	const entries: SideNavigationEntry[] = [
		{ kind: "custom", id: "logo", render: () => <SatisfactoryLogo /> },
		{
			kind: "group",
			id: "tools",
			label: "outils",
			items: SATISFACTORY_PAGES.map(({ label, href, icon }) => ({
				kind: "link" as const,
				id: href,
				label,
				href,
				icon,
				isActive: href === pathname,
			})),
		},
		{ kind: "spacer", id: "spacer" },
		{
			kind: "group",
			id: "site",
			items: [
				{
					kind: "link",
					id: "settings",
					label: "settings",
					href: SETTINGS_PATH,
					icon: Settings,
					isActive: pathname === SETTINGS_PATH,
				},
				{
					kind: "action",
					id: "colorScheme",
					label: isDark ? "thème clair" : "thème sombre",
					icon: isDark ? Moon : Sun,
					onClick: toggleColorScheme,
				},
				{
					kind: "link",
					id: "citadel",
					label: "la citadel",
					href: buildReturnToHomepagePath(ProjectsEnum.Satisfactory),
					icon: Castle,
				},
			],
		},
	];

	return (
		<SideNavigation
			label="Satisfactory"
			entries={entries}
			onNavigate={(href) => {
				void navigate(href);
			}}
			storageKey={NAVIGATION_STORAGE_KEY}
			placement="viewportEdge"
			compactBar={<SatisfactoryLogo />}
		>
			{children}
		</SideNavigation>
	);
}
