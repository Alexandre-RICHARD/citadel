type Args = {
	name: string;
	value: string;
	// 0 : cookie de session, supprimé à la fermeture du navigateur. Négatif : supprime le cookie
	hours?: number;
};

export function setCookie({ name, value, hours = 1 }: Args): void {
	let expires = "";
	if (hours) {
		const date = new Date();
		date.setTime(date.getTime() + hours * 60 * 60 * 1000);
		expires = `; expires=${date.toUTCString()}`;
	}
	document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
}
