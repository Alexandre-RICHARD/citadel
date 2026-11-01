import { useCallback, useState } from "react";

import type { OperationsStatus } from "../../../shared/operationsStatus.type";
import { apiRequest } from "../../api/apiRequest";
import { usePolling } from "../../api/usePolling";
import { waitForRequest } from "../../api/waitForRequest";
import { ActionButton } from "../ActionButton";
import { BackupsCard } from "../BackupsCard";
import { BannerCard } from "../BannerCard";
import { DeployCard } from "../DeployCard";
import { RequestDialog } from "../RequestDialog";
import { RestoreCard } from "../RestoreCard";
import type { FollowedRequest } from "./followedRequest.type";
import styles from "./operationsSection.module.scss";

type Props = {
	onError: (message: string) => void;
	onSuccess: (message: string) => void;
};

function messageOf(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

// Mises en production, bandeau et maintenance du site, sauvegardes et restauration de
// la base : des demandes à infra-ops (§14.2), suivies en direct dans une fenêtre.
// Deux lignes : le site (versions, bandeau), puis la base (sauvegardes, restauration).
export function OperationsSection({ onError, onSuccess }: Props) {
	const { data, error, refresh } = usePolling<OperationsStatus>(
		"/operations",
		30_000,
	);
	const [followed, setFollowed] = useState<FollowedRequest | null>(null);

	const send = useCallback(
		(
			path: string,
			body: unknown,
			title: string,
			next?: FollowedRequest["next"],
		) => {
			void (async () => {
				try {
					const { requestId } = await apiRequest<{ requestId: string }>(path, {
						method: "POST",
						body: body ?? {},
					});
					setFollowed({ id: requestId, title, next });
				} catch (sendError) {
					onError(messageOf(sendError));
				}
			})();
		},
		[onError],
	);

	const quick = useCallback(
		(path: string, body: unknown, done: string) => {
			void (async () => {
				try {
					const { requestId } = await apiRequest<{ requestId: string }>(path, {
						method: "POST",
						body: body ?? {},
					});
					const request = await waitForRequest(requestId);
					if (request.status === "ok") onSuccess(done);
					else onError(request.log.trim() || "Demande refusée par infra-ops");
				} catch (quickError) {
					onError(messageOf(quickError));
				} finally {
					refresh();
				}
			})();
		},
		[onError, onSuccess, refresh],
	);

	return (
		<section
			className={styles.operationsSection}
			aria-labelledby="operations-title"
		>
			<h2
				id="operations-title"
				className={styles.title}
			>
				Mises en production
			</h2>
			{error ? <p className={styles.error}>{error}</p> : null}
			{data ? (
				<>
					<div className={styles.cards}>
						<DeployCard
							status={data}
							send={send}
						/>
						<BannerCard
							status={data}
							quick={quick}
						/>
					</div>
					<div className={styles.cards}>
						<BackupsCard
							status={data}
							send={send}
						/>
						<RestoreCard
							status={data}
							send={send}
							onError={onError}
						/>
					</div>
				</>
			) : null}
			<RequestDialog
				request={followed}
				onClose={() => {
					setFollowed(null);
					refresh();
				}}
				renderFooter={(request) =>
					request.status === "ok" && followed?.next ? (
						<ActionButton
							label={followed.next.label}
							variant={followed.next.variant}
							onClick={followed.next.run}
						/>
					) : null
				}
			/>
		</section>
	);
}
