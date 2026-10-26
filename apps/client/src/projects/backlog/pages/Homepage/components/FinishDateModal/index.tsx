import { Flag } from "lucide-react";
import { useState } from "react";

import styles from "../../../../backlog.module.scss";
import { DateField } from "../../../../components/DateField";
import { Modal } from "../../../../components/Modal";
import { getTodayIsoDate } from "../../../../helper/date/getTodayIsoDate";
import { FormField } from "../FormField";
import { ModalActions } from "../ModalActions";

type Props = {
	// Le jeu et sa plateforme, ex. « Ico sur PS2 »
	subtitle: string;
	// « Plus tard » : la version jouée reste sans date de fin
	onCancel: () => void;
	onValidate: (finishDate: string) => void;
};

// Proposée au passage d'une version jouée au rang 5 ou plus sans date de fin, pré-remplie avec la date du jour (§6)
export function FinishDateModal({ subtitle, onCancel, onValidate }: Props) {
	const [finishDate, setFinishDate] = useState<string>(getTodayIsoDate);

	return (
		<Modal
			title="Date de fin"
			subtitle={subtitle}
			icon={Flag}
			size="sm"
			actions={
				<ModalActions
					cancelLabel="Plus tard"
					canValidate
					onCancel={onCancel}
					onValidate={() => onValidate(finishDate)}
				/>
			}
			onClose={onCancel}
		>
			<div className={styles.formStack}>
				<p className={styles.modalQuestion}>
					Quand l’as-tu fini pour la première fois ?
				</p>
				<FormField label="Date de fin">
					<DateField
						value={finishDate}
						commitOn="change"
						isNullable={false}
						label="Date de fin"
						onCommit={(date) => {
							if (date !== null) setFinishDate(date);
						}}
					/>
				</FormField>
			</div>
		</Modal>
	);
}
