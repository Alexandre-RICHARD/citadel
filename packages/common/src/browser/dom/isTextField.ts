const TEXT_INPUT_TYPES = ["text", "number", "date", "search"];

// Champ où l'on tape : les raccourcis de la page ne doivent pas y voler les touches
export function isTextField(
	target: EventTarget | null,
): target is HTMLInputElement | HTMLTextAreaElement {
	return (
		target instanceof HTMLTextAreaElement ||
		(target instanceof HTMLInputElement &&
			TEXT_INPUT_TYPES.includes(target.type))
	);
}
