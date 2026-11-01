import type { RequestItem } from "../../shared/requestItem.type.ts";
import { readStateJson } from "../state/readStateJson.ts";
import { readStateText } from "../state/readStateText.ts";

// Une demande, vue par infra-ops : reçue (state/requests/<id>.json), son log, et son
// code de sortie quand elle est finie (<id>.exit). null : pas encore reçue (infra-ops
// passe toutes les 2 secondes).
export async function readRequest(id: string): Promise<RequestItem | null> {
	const [received, log, exit] = await Promise.all([
		readStateJson<{ action?: string; receivedAt?: string }>(
			`requests/${id}.json`,
		),
		readStateText(`requests/${id}.log`),
		readStateText(`requests/${id}.exit`),
	]);
	if (received === null) return null;
	const exitCode = exit === null ? null : Number(exit.trim());
	return {
		id,
		action: received.action ?? "",
		receivedAt: received.receivedAt ?? null,
		status: exitCode === null ? "running" : exitCode === 0 ? "ok" : "fail",
		exitCode,
		log: log ?? "",
	};
}
