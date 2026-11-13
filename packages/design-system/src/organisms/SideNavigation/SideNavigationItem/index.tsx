import { isPlainLeftClick } from "@citadel/common/src/browser/events/isPlainLeftClick";

import styles from "../sideNavigation.module.scss";
import type { SideNavigationItem as Item } from "../sideNavigationItem.type";

type Props = {
	item: Item;
	isWide: boolean;
	onNavigate: (href: string) => void;
};

/** Un lien, une action ou un élément libre du menu ; réduit, seule l'icône se voit et le libellé passe en infobulle */
export function SideNavigationItem({ item, isWide, onNavigate }: Props) {
	if (item.kind === "custom")
		return <div className={styles.custom}>{item.render(isWide)}</div>;

	const { label, icon: Icon } = item;
	const content = (
		<>
			<span
				className={styles.itemIcon}
				aria-hidden
			>
				<Icon
					size={19}
					strokeWidth={2}
				/>
			</span>
			<span className={styles.itemLabel}>{label}</span>
		</>
	);

	if (item.kind === "action")
		return (
			<button
				type="button"
				className={styles.item}
				onClick={item.onClick}
				title={isWide ? undefined : label}
			>
				{content}
			</button>
		);

	return (
		<a
			href={item.href}
			className={styles.item}
			aria-current={item.isActive === true ? "page" : undefined}
			title={isWide ? undefined : label}
			onClick={(event) => {
				if (!isPlainLeftClick(event)) return;
				event.preventDefault();
				onNavigate(item.href);
			}}
		>
			{content}
		</a>
	);
}
