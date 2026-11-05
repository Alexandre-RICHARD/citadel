import { useIsMutating } from "@tanstack/react-query";
import { useState } from "react";

import { buildFailureMessage } from "../../../common/api/error/buildFailureMessage";
import { getErrorReason } from "../../../common/api/error/getErrorReason";
import { isTransientApiError } from "../../../common/api/error/isTransientApiError";
import { notifyMutationFailure } from "../../../common/api/mutation/notifyMutationFailure";
import { authErrorReasons } from "../api/authErrorReasons";
import { authFieldLabels } from "../api/authFieldLabels";
import { useLogout } from "../api/sessions/useLogout";

/**
 * La déconnexion, sans confirmation, sauf si des modifications partent encore (une mort comptée dans GDC juste avant de
 * revenir ici) : la déconnexion vide le cache, et leur échec ne serait plus signalé nulle part
 */
export function useLogoutWithWarning() {
	const logout = useLogout();
	const pendingMutationCount = useIsMutating();
	const [isWarning, setIsWarning] = useState(false);

	function logOutNow(): void {
		setIsWarning(false);
		logout.mutate(undefined, {
			onError: (error) => {
				notifyMutationFailure({
					message: buildFailureMessage(
						"se déconnecter",
						getErrorReason(error, {
							projectReasons: authErrorReasons,
							fieldLabels: authFieldLabels,
						}),
					),
					...(isTransientApiError(error) && { retry: logOutNow }),
				});
			},
		});
	}

	function requestLogout(): void {
		if (pendingMutationCount > 0) setIsWarning(true);
		else logOutNow();
	}

	return {
		requestLogout,
		isWarning,
		confirmLogout: logOutNow,
		cancelLogout: () => setIsWarning(false),
		isPending: logout.isPending,
	};
}
