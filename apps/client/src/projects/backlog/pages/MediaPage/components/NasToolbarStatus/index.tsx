import { KeyRound, Lock } from "lucide-react";

import type { NasStatusFm } from "../../../../api/model/nas/nasStatusFm.type";
import { useLockNas } from "../../../../api/nas/useLockNas";
import { Button } from "../../../../components/Button";
import nasStyles from "../../../../nas.module.scss";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
	dateStyle: "medium",
	timeStyle: "short",
});

type Props = {
	nas: NasStatusFm;
	onUnlock: () => void;
};

/**
 * Le mode connecté dans la barre du haut (§2) : fermé, un bouton pour donner le mot de passe des médias ; ouvert, la
 * date du relevé du job, un lien vers son rapport dans la console, et de quoi reverrouiller. Rien sur le site public
 */
export function NasToolbarStatus({ nas, onUnlock }: Props) {
	const lockNas = useLockNas();
	if (!nas.isAvailable) return null;
	if (!nas.isUnlocked)
		return (
			<Button
				icon={KeyRound}
				tooltip="Les colonnes du NAS, avec le mot de passe des médias"
				tooltipPlacement="bottom"
				onClick={onUnlock}
			>
				Mode connecté
			</Button>
		);
	return (
		<span className={nasStyles.status}>
			<span>
				{nas.surveyedAt === null
					? "Aucun relevé du NAS"
					: `Relevé du ${dateFormatter.format(new Date(nas.surveyedAt))}`}
			</span>
			{nas.consoleUrl !== null && (
				<a
					href={nas.consoleUrl}
					target="_blank"
					rel="noreferrer"
				>
					Rapport
				</a>
			)}
			<Button
				icon={Lock}
				variant="ghost"
				size="sm"
				ariaLabel="Reverrouiller le mode connecté"
				tooltip="Reverrouiller le mode connecté"
				tooltipPlacement="bottom"
				isLoading={lockNas.isPending}
				onClick={() => lockNas.mutate()}
			/>
		</span>
	);
}
