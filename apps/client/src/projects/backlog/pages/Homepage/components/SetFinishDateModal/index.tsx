import { useUpdateUserVersion } from "../../../../api/userVersion/useUpdateUserVersion";
import { FinishDateModal } from "../FinishDateModal";

type Props = {
	gameId: number;
	userVersionId: number;
	gameName: string;
	platformName: string;
	onClose: () => void;
};

// Date de fin d'une version jouée du tableau, après son passage au rang 5 ou plus
export function SetFinishDateModal({
	gameId,
	userVersionId,
	gameName,
	platformName,
	onClose,
}: Props) {
	const updateUserVersion = useUpdateUserVersion(
		gameId,
		userVersionId,
		"finishDate",
	);

	return (
		<FinishDateModal
			subtitle={`${gameName} sur ${platformName}`}
			onCancel={onClose}
			onValidate={(finishDate) => {
				updateUserVersion.mutate({ finishDate });
				onClose();
			}}
		/>
	);
}
