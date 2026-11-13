import { LogOut } from "lucide-react";

import { useDeleteAllSessions } from "../../../../api/sessions/useDeleteAllSessions";
import { useDeleteOtherSessions } from "../../../../api/sessions/useDeleteOtherSessions";
import { useDeleteSession } from "../../../../api/sessions/useDeleteSession";
import { useSessions } from "../../../../api/sessions/useSessions";
import { FormAlert } from "../../../../components/FormAlert";
import { describeSessionDevice } from "../../../../helper/session/describeSessionDevice";
import { useAuthFailure } from "../../../../hooks/useAuthFailure";
import { ProfileSubsection } from "../ProfileSubsection";
import styles from "./sessionsSection.module.scss";

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("fr-FR", {
	dateStyle: "medium",
	timeStyle: "short",
});

// Les sessions ouvertes du compte, avec leur fin prévue. Se déconnecter d'une session, de toutes les autres, ou de toutes
// (celle-ci comprise) ne demande aucune confirmation
export function SessionsSection() {
	const { sessions, isError, retry } = useSessions();
	const deleteSession = useDeleteSession();
	const deleteOthers = useDeleteOtherSessions();
	const deleteAll = useDeleteAllSessions();
	const { failure, report, clear } = useAuthFailure(
		"déconnecter cette session",
	);

	function disconnect(sessionId: number): void {
		clear();
		deleteSession.mutate(sessionId, {
			onError: (error) => {
				report(error, () => disconnect(sessionId));
			},
		});
	}

	function disconnectOthers(): void {
		clear();
		deleteOthers.mutate(undefined, {
			onError: (error) => {
				report(error, disconnectOthers);
			},
		});
	}

	function disconnectAll(): void {
		clear();
		deleteAll.mutate(undefined, {
			onError: (error) => {
				report(error, disconnectAll);
			},
		});
	}

	const isBusy =
		deleteSession.isPending || deleteOthers.isPending || deleteAll.isPending;

	return (
		<ProfileSubsection
			title="Sessions actives"
			lead="Les appareils connectés à votre compte. Une session que vous ne reconnaissez pas : déconnectez-la, puis changez votre mot de passe."
		>
			{isError ? (
				<FormAlert
					tone="error"
					onRetry={() => {
						void retry();
					}}
				>
					Impossible de lire vos sessions.
				</FormAlert>
			) : sessions === undefined ? (
				<p
					className={styles.empty}
					role="status"
				>
					Chargement…
				</p>
			) : (
				<ul className={styles.sessions}>
					{sessions.map((session) => (
						<li
							key={session.id}
							className={styles.session}
						>
							<div className={styles.text}>
								<strong>
									{describeSessionDevice(session.browser, session.system)}
									{session.isCurrent && (
										<span className={styles.current}>Cette session</span>
									)}
								</strong>
								<span>
									Dernière activité le{" "}
									{DATE_TIME_FORMAT.format(session.lastSeenAt)} · Réseau{" "}
									{session.ip}
								</span>
								<span>
									Ouverte le {DATE_TIME_FORMAT.format(session.createdAt)} · fin
									prévue le {DATE_TIME_FORMAT.format(session.expiresAt)}
								</span>
							</div>
							<button
								type="button"
								className={styles.disconnect}
								onClick={() => disconnect(session.id)}
								disabled={isBusy}
							>
								<LogOut aria-hidden />
								{session.isCurrent ? "Me déconnecter" : "Déconnecter"}
							</button>
						</li>
					))}
				</ul>
			)}
			{failure !== null && (
				<FormAlert
					tone="error"
					onRetry={failure.retry}
				>
					{failure.message}
				</FormAlert>
			)}
			<div className={styles.actions}>
				<button
					type="button"
					className={styles.action}
					onClick={disconnectOthers}
					disabled={isBusy || (sessions?.length ?? 0) < 2}
				>
					Tout déconnecter sauf ici
				</button>
				<button
					type="button"
					className={styles.action}
					onClick={disconnectAll}
					disabled={isBusy}
				>
					Tout déconnecter
				</button>
			</div>
		</ProfileSubsection>
	);
}
