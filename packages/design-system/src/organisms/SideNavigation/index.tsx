import { buildNarrowerThanQuery } from "@citadel/common/src/browser/dom/buildNarrowerThanQuery";
import { useLocalStorage } from "@citadel/common/src/react/hooks/useLocalStorage";
import { useMediaQuery } from "@citadel/common/src/react/hooks/useMediaQuery";
import { readBooleanOr } from "@citadel/common/src/universal/value/readBooleanOr";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
	type CSSProperties,
	Fragment,
	type ReactNode,
	useId,
	useRef,
} from "react";

import { BurgerButton } from "../../atoms/BurgerButton";
import styles from "./sideNavigation.module.scss";
import type { SideNavigationEntry } from "./sideNavigationEntry.type";
import { SideNavigationItem } from "./SideNavigationItem";
import { useDrawer } from "./useDrawer";
import { usePeek } from "./usePeek";

type Labels = {
	expand: string;
	collapse: string;
	openMenu: string;
	closeMenu: string;
};

const DEFAULT_LABELS: Labels = {
	expand: "Déplier le menu",
	collapse: "Replier le menu",
	openMenu: "Ouvrir le menu",
	closeMenu: "Fermer le menu",
};

type Props = {
	/** Le nom du menu pour les lecteurs d'écran */
	label: string;
	entries: readonly SideNavigationEntry[];
	/** Appelé au clic simple sur un lien à la place du chargement de la page (le design system ne connaît pas le routeur) */
	onNavigate: (href: string) => void;
	/** Où ce navigateur retient si le menu est déplié : une clé par menu */
	storageKey: string;
	isExpandedByDefault?: boolean;
	/**
	 * « inline » : une colonne dans la page, qui reste en vue au défilement. « viewportEdge » : collé au bord gauche de la
	 * fenêtre, sur toute sa hauteur
	 */
	placement?: "inline" | "viewportEdge";
	/** En dessous de cette largeur de fenêtre (px), le menu se range derrière un bouton et s'ouvre en tiroir */
	compactBelow?: number;
	/** Largeur du menu déplié (px) */
	expandedWidth?: number;
	/** À côté du bouton menu, sur petit écran : la page en cours, un logo… */
	compactBar?: ReactNode;
	labels?: Partial<Labels>;
	/** La page : le menu déplié la pousse, réduit il ne lui prend que la largeur de ses icônes */
	children: ReactNode;
};

/**
 * Menu latéral. Déplié, il pousse la page ; réduit à ses icônes, il s'ouvre par-dessus au survol, au clavier ou au
 * doigt. Le choix déplié / réduit est retenu par menu dans ce navigateur. Sur petit écran, il se range derrière un
 * bouton menu et s'ouvre en tiroir
 */
export function SideNavigation({
	label,
	entries,
	onNavigate,
	storageKey,
	isExpandedByDefault = true,
	placement = "inline",
	compactBelow = 768,
	expandedWidth = 240,
	compactBar,
	labels: labelOverrides,
	children,
}: Props) {
	const labels = { ...DEFAULT_LABELS, ...labelOverrides };
	const panelId = useId();
	const barRef = useRef<HTMLDivElement>(null);
	const isCompact = useMediaQuery(buildNarrowerThanQuery(compactBelow));
	const [isExpanded, setIsExpanded] = useLocalStorage(storageKey, (stored) =>
		readBooleanOr(stored, isExpandedByDefault),
	);
	const peek = usePeek(!isCompact && !isExpanded);
	const { isPeeking, closePeek, panelRef } = peek;
	const { isDrawerOpen, drawerTop, burgerRef, toggleDrawer, closeDrawer } =
		useDrawer(isCompact, barRef, panelRef);
	const isWide = isCompact || isExpanded || isPeeking;

	function navigate(href: string): void {
		closePeek();
		closeDrawer({ returnFocus: false });
		onNavigate(href);
	}

	function renderItems(entry: SideNavigationEntry): ReactNode {
		switch (entry.kind) {
			case "spacer":
				return (
					<div
						className={styles.spacer}
						aria-hidden
					/>
				);
			case "group":
				return (
					<div
						role="group"
						aria-label={entry.label}
						className={styles.group}
					>
						{entry.label !== undefined && (
							<p
								className={styles.groupLabel}
								aria-hidden
							>
								{entry.label}
							</p>
						)}
						{entry.items.map((item) => (
							<SideNavigationItem
								key={item.id}
								item={item}
								isWide={isWide}
								onNavigate={navigate}
							/>
						))}
					</div>
				);
			default:
				return (
					<SideNavigationItem
						item={entry}
						isWide={isWide}
						onNavigate={navigate}
					/>
				);
		}
	}

	const ExpandIcon = isExpanded ? PanelLeftClose : PanelLeftOpen;
	const expandLabel = isExpanded ? labels.collapse : labels.expand;

	return (
		<div
			className={styles.shell}
			data-placement={placement}
			data-compact={isCompact}
			data-expanded={isExpanded}
			style={
				{
					"--side-navigation-expanded-width": `${expandedWidth}px`,
					"--side-navigation-drawer-top": `${drawerTop}px`,
				} as CSSProperties
			}
		>
			{isCompact && (
				<>
					<div
						ref={barRef}
						className={styles.compactBar}
						data-open={isDrawerOpen}
					>
						<BurgerButton
							ref={burgerRef}
							isOpen={isDrawerOpen}
							onToggle={toggleDrawer}
							openLabel={labels.openMenu}
							closeLabel={labels.closeMenu}
							controls={panelId}
						/>
						{compactBar}
					</div>
					<div
						className={styles.backdrop}
						data-open={isDrawerOpen}
						onClick={() => closeDrawer({ returnFocus: true })}
						aria-hidden
					/>
				</>
			)}
			<div className={styles.slot}>
				<nav
					ref={panelRef}
					id={panelId}
					aria-label={label}
					className={styles.panel}
					data-wide={isWide}
					data-open={isDrawerOpen}
					onPointerEnter={peek.onPointerEnter}
					onPointerLeave={peek.onPointerLeave}
					onPointerDown={peek.onPointerDown}
					onClickCapture={peek.onClickCapture}
					onFocus={peek.onFocus}
					onBlur={peek.onBlur}
				>
					<div className={styles.entries}>
						{entries.map((entry) => (
							<Fragment key={entry.id}>{renderItems(entry)}</Fragment>
						))}
					</div>
					{!isCompact && (
						<button
							type="button"
							className={`${styles.item} ${styles.expandToggle}`}
							onClick={() => {
								closePeek();
								setIsExpanded(!isExpanded);
							}}
							aria-expanded={isExpanded}
							title={isWide ? undefined : expandLabel}
						>
							<span
								className={styles.itemIcon}
								aria-hidden
							>
								<ExpandIcon
									size={19}
									strokeWidth={2}
								/>
							</span>
							<span className={styles.itemLabel}>{expandLabel}</span>
						</button>
					)}
				</nav>
			</div>
			<div
				className={styles.content}
				inert={isDrawerOpen}
			>
				{children}
			</div>
		</div>
	);
}
