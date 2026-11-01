import type { ApiErrorBody } from "../../shared/apiErrorBody.type";
import { ApiError } from "./ApiError";

// Envoie un dump (.sql.zst) depuis ton PC : le fichier tel quel, sans JSON. Renvoie la
// source à restaurer (« upload:<id> »).
export async function uploadDump(file: File): Promise<string> {
	let response: Response;
	try {
		response = await fetch("/api/operations/restore-upload", {
			method: "POST",
			headers: { "Content-Type": "application/octet-stream" },
			body: file,
		});
	} catch {
		throw new ApiError(0, "Console injoignable");
	}
	if (!response.ok) {
		const body = (await response
			.json()
			.catch(() => null)) as ApiErrorBody | null;
		throw new ApiError(
			response.status,
			body?.message ?? `Erreur ${response.status}`,
		);
	}
	return ((await response.json()) as { uploadId: string }).uploadId;
}
