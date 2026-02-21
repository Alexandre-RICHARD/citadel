import { NavLink } from "react-router";

import { IconContainer } from "../../../../common/components/icon/Icon";
import { IconTokenEnum } from "../../../../common/components/icon/iconToken.enum";
import styles from "./navigation.module.scss";
import { navigationGroups } from "./navigationGroups";

export function Navigation() {
	return (
		<nav className={styles.navigationMenuContainer}>
			<ul className={`${styles.navbarItems} ${styles.flexboxCol}`}>
				<li className={`${styles.navbarLogo} ${styles.flexboxLeft}`}>
					<NavLink
						to=""
						className={`${styles.navbarItemInner} ${styles.flexbox}`}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							id="Layer_1"
							data-name="Layer 1"
							viewBox="0 0 1438.88 1819.54"
						>
							<polygon points="925.79 318.48 830.56 0 183.51 1384.12 510.41 1178.46 925.79 318.48" />
							<polygon points="1438.88 1663.28 1126.35 948.08 111.98 1586.26 0 1819.54 1020.91 1250.57 1123.78 1471.02 783.64 1663.28 1438.88 1663.28" />
						</svg>
					</NavLink>
				</li>
				{navigationGroups.map((group) => {
					return group.naviItem.map((navItem) => (
						<li
							key={`${group.groupLabel}${navItem.link}`}
							className={`${styles.navbarItem} ${styles.flexboxLeft}`}
						>
							<NavLink
								to={navItem.link}
								className={`${styles.navbarItemInner} ${styles.flexboxLeft}`}
							>
								<div
									className={`${styles.navbarItemInnerIconWrapper} ${styles.flexbox}`}
								>
									<IconContainer
										iconToken={IconTokenEnum[navItem.icon]}
										size={20}
										color="#fefefe"
									/>
								</div>
								<span className={styles.linkText}>{navItem.label}</span>
							</NavLink>
						</li>
					));
				})}
			</ul>
		</nav>
	);
}
