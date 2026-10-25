// Les chemins que le site ne sert jamais, et que les robots essaient partout : WordPress,
// PHP, outils d'administration connus, fichiers de configuration oubliés…
// Une requête qui en vise un, c'est un scan : quelqu'un cherche une faille connue.
const SUSPICIOUS_PREFIXES = [
	"/wp-",
	"/wordpress",
	"/xmlrpc",
	"/phpmyadmin",
	"/pma/",
	"/myadmin",
	"/cgi-bin",
	"/vendor/",
	"/actuator",
	"/administrator",
	"/manager/html",
	"/boaform",
	"/hnap1",
	"/owa/",
	"/autodiscover",
	"/_ignition",
	"/telescope",
	"/solr",
	"/geoserver",
];

// Langages côté serveur que le site n'utilise pas, et fichiers qui ne devraient jamais
// être en ligne (sauvegardes, configuration, journaux)
const SUSPICIOUS_EXTENSIONS = new Set([
	"php",
	"asp",
	"aspx",
	"jsp",
	"cgi",
	"sql",
	"bak",
	"old",
	"ini",
	"conf",
	"yml",
	"yaml",
	"log",
	"swp",
]);

function extensionOf(path: string): string {
	const lastSegment = path.slice(path.lastIndexOf("/") + 1);
	const dot = lastSegment.lastIndexOf(".");
	return dot === -1 ? "" : lastSegment.slice(dot + 1);
}

export function isSuspiciousPath(uri: string): boolean {
	const path = (uri.split("?")[0] ?? "").toLowerCase();

	// Fichiers cachés (.env, .git/config, .aws…), sauf .well-known, qui sert aux certificats
	if (path.includes("/.") && !path.startsWith("/.well-known/")) return true;
	// Remonter dans les dossiers du serveur : /../../etc/passwd
	if (
		path.includes("..") ||
		path.includes("%2e%2e") ||
		path.includes("/etc/passwd")
	)
		return true;
	if (SUSPICIOUS_PREFIXES.some((prefix) => path.startsWith(prefix)))
		return true;
	return SUSPICIOUS_EXTENSIONS.has(extensionOf(path));
}
