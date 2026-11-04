type UserAgentDescription = {
	browser: string | null;
	system: string | null;
};

// Dans l'ordre : le premier motif trouvé gagne, car un user agent en cite plusieurs (Edge se dit aussi Chrome et
// Safari, Chrome se dit aussi Safari, un iPhone se dit aussi Mac OS X, Android aussi Linux)
const BROWSERS: [RegExp, string][] = [
	[/Edg(?:e|A|iOS)?\//u, "Edge"],
	[/OPR\/|Opera/u, "Opera"],
	[/Firefox\/|FxiOS\//u, "Firefox"],
	[/Chrome\/|CriOS\//u, "Chrome"],
	[/Safari\//u, "Safari"],
];

const SYSTEMS: [RegExp, string][] = [
	[/Windows/u, "Windows"],
	[/Android/u, "Android"],
	[/iPhone|iPad|iPod/u, "iOS"],
	[/Mac OS X|Macintosh/u, "macOS"],
	[/CrOS/u, "ChromeOS"],
	[/Linux|X11/u, "Linux"],
];

function findName(
	userAgent: string,
	candidates: [RegExp, string][],
): string | null {
	return candidates.find(([pattern]) => pattern.test(userAgent))?.[1] ?? null;
}

/**
 * Le navigateur et le système d'un user agent, pour que le propriétaire reconnaisse ses sessions : leurs noms seulement,
 * sans version. Un user agent absent ou inconnu donne null, jamais une supposition
 */
export function describeUserAgent(
	userAgent: string | null,
): UserAgentDescription {
	if (userAgent === null) return { browser: null, system: null };
	return {
		browser: findName(userAgent, BROWSERS),
		system: findName(userAgent, SYSTEMS),
	};
}
