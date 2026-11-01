import { readStateText } from "./readStateText.ts";

// Un fichier JSON de state/ ; null s'il manque ou se lit mal (infra-ops écrit à côté puis
// renomme : jamais à moitié, mais un fichier abîmé ne doit pas faire tomber la console)
export async function readStateJson<T>(fileName: string): Promise<T | null> {
	const text = await readStateText(fileName);
	if (text === null) return null;
	try {
		return JSON.parse(text) as T;
	} catch {
		return null;
	}
}
