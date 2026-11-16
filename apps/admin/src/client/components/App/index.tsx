import { useEffect, useState } from "react";

import type { SessionInfo } from "../../../shared/sessionInfo.type";
import { apiRequest } from "../../api/apiRequest";
import { UNAUTHORIZED_EVENT } from "../../api/unauthorizedEvent";
import { Dashboard } from "../Dashboard";
import { LoginScreen } from "../LoginScreen";
import { MediaReportPage } from "../MediaReportPage";

// « checking » : on demande au serveur si le cookie de session est encore bon
type SessionState = "checking" | "anonymous" | SessionInfo;

function fetchSession(): Promise<SessionState> {
	return apiRequest<SessionInfo>("/session").catch(() => "anonymous" as const);
}

export function App() {
	const [session, setSession] = useState<SessionState>("checking");

	useEffect(() => {
		let cancelled = false;
		void fetchSession().then((state) => {
			if (!cancelled) setSession(state);
			return state;
		});
		function onUnauthorized(): void {
			setSession("anonymous");
		}
		window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
		return () => {
			cancelled = true;
			window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
		};
	}, []);

	if (session === "checking") return null;
	if (session === "anonymous")
		return (
			<LoginScreen
				onLoggedIn={() => {
					void fetchSession().then(setSession);
				}}
			/>
		);
	function logout(): void {
		void apiRequest("/logout", { method: "POST" }).finally(() => {
			setSession("anonymous");
		});
	}
	// Deux pages : l'accueil, et le rapport des médias (/media), où mène aussi le backlog en mode connecté
	if (window.location.pathname === "/media")
		return (
			<MediaReportPage
				consoleVersion={session.consoleVersion}
				onLogout={logout}
			/>
		);
	return (
		<Dashboard
			consoleVersion={session.consoleVersion}
			onLogout={logout}
		/>
	);
}
