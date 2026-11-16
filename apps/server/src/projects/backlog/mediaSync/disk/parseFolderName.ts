// Le nom d'un dossier de film ou de série : « Titre (année) », l'année étant facultative
export function parseFolderName(name: string): {
	title: string;
	year: number | null;
} {
	const match = /^(?<title>.*?)\s*\((?<year>\d{4})\)/u.exec(name);
	const title = match?.groups?.title.trim() ?? "";
	if (match?.groups === undefined || title === "")
		return { title: name.trim(), year: null };
	return { title, year: Number(match.groups.year) };
}
