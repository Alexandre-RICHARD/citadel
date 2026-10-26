import { Check } from "lucide-react";

import { Button } from "../../../../components/Button";

type Props = {
	validateLabel?: string;
	cancelLabel?: string;
	canValidate: boolean;
	onCancel: () => void;
	onValidate: () => void;
};

// « Annuler » et « Valider » d'une modale
export function ModalActions({
	validateLabel = "Valider",
	cancelLabel = "Annuler",
	canValidate,
	onCancel,
	onValidate,
}: Props) {
	return (
		<>
			<Button onClick={onCancel}>{cancelLabel}</Button>
			<Button
				variant="primary"
				icon={Check}
				disabled={!canValidate}
				onClick={onValidate}
			>
				{validateLabel}
			</Button>
		</>
	);
}
