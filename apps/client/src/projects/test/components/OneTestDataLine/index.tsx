import { formatDate } from "@citadel/common/src/universal/date/formatDate";
import { LanguageEnum } from "@citadel/common/src/universal/language/language.enum";
import { Button } from "@citadel/design-system/src/atoms/Button";
import { NavLink } from "react-router";

import type { TestFm } from "../../api/testFm.type";
import styles from "./oneTestDataLine.module.scss";

type Props = {
	test: TestFm;
	pending?: boolean;
	setSelectedTestData?: (newSelectedTestData: TestFm) => void;
	onDelete?: () => void;
};

export function OneTestDataLine({
	test,
	pending,
	setSelectedTestData,
	onDelete,
}: Props) {
	return (
		<tr className={pending ? styles.dataLinePending : undefined}>
			<td>
				<NavLink to={test.id.toString()}>{test.id}</NavLink>
			</td>
			<td>{test.name}</td>
			<td>{test.isActive ? "OUI" : "NON"}</td>
			<td>{formatDate(test.createdAt, LanguageEnum.FRENCH)}</td>
			<td>
				<Button
					label="✏️"
					onClick={() => setSelectedTestData?.(test)}
				/>
			</td>
			<td>
				<Button
					label="🗑️"
					onClick={() => onDelete?.()}
				/>
			</td>
		</tr>
	);
}
