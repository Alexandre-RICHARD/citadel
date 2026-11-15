// La console n'a pas de HTTPS (accès par le LAN ou Tailscale) : hors contexte sécurisé,
// navigator.clipboard n'existe pas. On se rabat alors sur l'ancienne copie par sélection.
function copyBySelection(text: string): boolean {
	const field = document.createElement("textarea");
	field.value = text;
	field.setAttribute("readonly", "");
	field.style.position = "fixed";
	field.style.opacity = "0";
	document.body.appendChild(field);
	field.select();
	try {
		return document.execCommand("copy");
	} finally {
		document.body.removeChild(field);
	}
}

/** Copie le texte dans le presse-papiers ; rejette si le navigateur refuse */
export async function copyToClipboard(text: string): Promise<void> {
	if (window.isSecureContext && navigator.clipboard) {
		await navigator.clipboard.writeText(text);
		return;
	}
	if (!copyBySelection(text))
		throw new Error("Copie refusée par le navigateur");
}
