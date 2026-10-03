import { ErrorState } from "@citadel/design-system/src/molecules/ErrorState";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { buildFailureMessage } from "../../common/api/error/buildFailureMessage";
import type { ErrorReasons } from "../../common/api/error/errorReasons.type";
import { getErrorReason } from "../../common/api/error/getErrorReason";
import { isTransientApiError } from "../../common/api/error/isTransientApiError";
import { ErrorBoundary } from "../ErrorBoundary";

type Props = {
	children: ReactNode;
	// Complète « Impossible de … » dans le message affiché, ex. « charger les jeux »
	actionLabel: string;
	// Codes métier du projet
	errorReasons?: ErrorReasons;
};

// Une zone qui lit des données (useSuspenseQuery) : son erreur la remplace sans casser le reste de la page.
// Réessayer n'est proposé que pour un échec passager
export function QueryErrorBoundary({
	children,
	actionLabel,
	errorReasons,
}: Props) {
	const { reset } = useQueryErrorResetBoundary();

	return (
		<ErrorBoundary
			onReset={reset}
			renderFallback={(error, retry) => (
				<ErrorState
					message={buildFailureMessage(
						actionLabel,
						getErrorReason(error, {
							...(errorReasons && { projectReasons: errorReasons }),
						}),
					)}
					onRetry={isTransientApiError(error) ? retry : undefined}
				/>
			)}
		>
			{children}
		</ErrorBoundary>
	);
}
