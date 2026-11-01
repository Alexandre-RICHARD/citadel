import type { RequestItem } from "../../shared/requestItem.type";
import { apiRequest } from "./apiRequest";

const POLL_MS = 1000;
// Bandeau, maintenance : infra-ops répond en 2 à 3 s. Au-delà, il est sans doute arrêté.
const TIMEOUT_MS = 30_000;

function sleep(milliseconds: number): Promise<void> {
	return new Promise((resolve) => {
		window.setTimeout(resolve, milliseconds);
	});
}

// Attend la fin d'une demande courte, sans fenêtre : la console affiche ensuite le
// résultat dans un toast
export async function waitForRequest(
	id: string,
	deadline = Date.now() + TIMEOUT_MS,
): Promise<RequestItem> {
	const request = await apiRequest<RequestItem | null>(`/requests/${id}`);
	if (request && request.status !== "running") return request;
	if (Date.now() > deadline)
		throw new Error("infra-ops ne répond pas : la demande reste en attente");
	await sleep(POLL_MS);
	return waitForRequest(id, deadline);
}
