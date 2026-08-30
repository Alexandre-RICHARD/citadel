import type { TestDto } from "@specs/projects/test/dto/test.dto";
import { NavLink } from "react-router";

import { Button } from "../../../../common/components/components/atoms/Button/index.tsx";
import { formatDate } from "../../../../common/helpers/date/formatDate.ts";
import { LanguageEnum } from "../../../../common/language/language.enum.ts";
import styles from "./oneTestDataLine.module.scss";

type Props = {
	test: TestDto;
	pending?: boolean;
	setSelectedTestData?: (newSelectedTestData: TestDto) => void;
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
