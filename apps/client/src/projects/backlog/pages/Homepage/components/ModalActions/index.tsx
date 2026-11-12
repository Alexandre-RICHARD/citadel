import { Check, CopyPlus } from "lucide-react";

import { Button } from "../../../../components/Button";

type Props = {
	validateLabel?: string;
	cancelLabel?: string;
	canValidate: boolean;
	// Une seconde validation, qui enchaîne : « Valider et en ajouter une autre »
	chainLabel?: string;
	onCancel: () => void;
	onValidate: () => void;
	onValidateAndChain?: () => void;
};

// « Annuler » et « Valider » d'une modale, et facultativement une validation qui enchaîne sur la suivante
export function ModalActions({
	validateLabel = "Valider",
	cancelLabel = "Annuler",
	canValidate,
	chainLabel,
	onCancel,
	onValidate,
	onValidateAndChain,
}: Props) {
	return (
		<>
			<Button onClick={onCancel}>{cancelLabel}</Button>
			{onValidateAndChain !== undefined && (
				<Button
					icon={CopyPlus}
					disabled={!canValidate}
					onClick={onValidateAndChain}
				>
					{chainLabel}
				</Button>
			)}
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
