import { useCallback, useState } from "react";

import { resolveAuthFailure } from "../helper/resolveAuthFailure";

type ShownFailure = {
	message: string;
	code: string | null;
	retry: (() => void) | undefined;
};

/**
 * L'échec de la dernière action d'un formulaire : une attente imposée (le bouton patiente avec son compte à rebours) ou
 * un message dans la page, avec « Réessayer » s'il est passager
 */
export function useAuthFailure(actionLabel: string) {
	const [waitUntil, setWaitUntil] = useState<number | null>(null);
	const [failure, setFailure] = useState<ShownFailure | null>(null);

	const report = useCallback(
		(error: unknown, retry?: () => void): string | null => {
			const resolved = resolveAuthFailure(error, actionLabel, Date.now());
			if (resolved.kind === "wait") {
				setWaitUntil(resolved.retryAt);
				setFailure(null);
				return resolved.code;
			}
			setFailure({
				message: resolved.message,
				code: resolved.code,
				retry: resolved.isRetryable ? retry : undefined,
			});
			return resolved.code;
		},
		[actionLabel],
	);

	const clear = useCallback(() => {
		setFailure(null);
	}, []);

	return { waitUntil, failure, report, clear };
}
