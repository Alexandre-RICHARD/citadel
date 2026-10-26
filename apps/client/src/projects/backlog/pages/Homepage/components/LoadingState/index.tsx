import type { ReactNode } from "react";

import { buildFailureMessage } from "../../../../../../common/api/error/buildFailureMessage";
import { getErrorReason } from "../../../../../../common/api/error/getErrorReason";
import { backlogErrorReasons } from "../../../../api/backlogErrorReasons";
import styles from "../../../../backlog.module.scss";
import { Callout } from "../../../../components/Callout";
import { Spinner } from "../../../../components/Spinner";

type Props = {
	// null tant que la lecture n'a pas échoué
	error: unknown;
	// Complète « Impossible de … » si la lecture échoue, ex. « charger le jeu »
	actionLabel: string;
	children: ReactNode;
};

// Données d'une modale en cours de chargement, ou leur échec, en français
export function LoadingState({ error, actionLabel, children }: Props) {
	if (error === null)
		return (
			<div className={styles.loadingState}>
				<Spinner className={styles.loadingSpinner} />
				{children}
			</div>
		);
	return (
		<Callout tone="danger">
			{buildFailureMessage(
				actionLabel,
				getErrorReason(error, { projectReasons: backlogErrorReasons }),
			)}
		</Callout>
	);
}
