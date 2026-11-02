import { RequestOriginEnum } from "./requestOrigin.enum.ts";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function readOriginHost(origin: string): string | null {
	try {
		return new URL(origin).host;
	} catch {
		return null;
	}
}

type Request = {
	method: string;
	// En-têtes Origin et Host de la requête
	origin: string | undefined;
	host: string | undefined;
};

// Classe une requête par son en-tête Origin, comparé à l'hôte qu'elle vise (protection CSRF)
export function classifyRequestOrigin({
	method,
	origin,
	host,
}: Request): RequestOriginEnum {
	if (SAFE_METHODS.has(method.toUpperCase()))
		return RequestOriginEnum.SAFE_METHOD;
	if (origin === undefined) return RequestOriginEnum.MISSING;
	const originHost = readOriginHost(origin);
	return originHost !== null && originHost === host
		? RequestOriginEnum.SAME_HOST
		: RequestOriginEnum.FOREIGN;
}
