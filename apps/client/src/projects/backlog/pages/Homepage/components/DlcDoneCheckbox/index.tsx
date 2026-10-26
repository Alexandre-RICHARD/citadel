import type { DlcFm } from "../../../../api/model/dlcFm.type";
import { useSetDlcDone } from "../../../../api/userVersion/useSetDlcDone";
import { Checkbox } from "../../../../components/Checkbox";

type Props = {
	gameId: number;
	userVersionId: number;
	dlc: DlcFm;
	isDone: boolean;
};

// Case « fait » d'un DLC, enregistrée tout de suite ; inactive le temps de l'enregistrement
export function DlcDoneCheckbox({ gameId, userVersionId, dlc, isDone }: Props) {
	const setDlcDone = useSetDlcDone(gameId, userVersionId, dlc.id);

	return (
		<Checkbox
			checked={isDone}
			label={dlc.name}
			disabled={setDlcDone.isPending}
			onChange={() => setDlcDone.mutate({ isDone: !isDone })}
		/>
	);
}
