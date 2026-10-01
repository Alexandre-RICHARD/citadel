import type { ReactNode } from "react";

import { Icon } from "../../atoms/Icon";
import { IconTokenEnum } from "../../atoms/Icon/iconToken.enum";
import styles from "./buttonSelect.module.scss";

type PropsType = {
	selectorId: string;
	label: string | ReactNode;
	onClick: () => void;
};

export function ButtonSelect({
	selectorId,
	label,
	onClick,
}: PropsType): ReactNode {
	return (
		<button
			id={selectorId}
			type="button"
			className={styles.button_select}
			onClick={onClick}
		>
			<div className={styles.selector_content}>
				{label}
				<Icon
					iconToken={IconTokenEnum.DropdownArrow}
					size={15}
					color="#ffffff"
				/>
			</div>
		</button>
	);
}
