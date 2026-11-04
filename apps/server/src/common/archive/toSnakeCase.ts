// « lastLoginAt » -> « last_login_at » : le nom de la colonne SQL, que l'utilisateur retrouve dans les fichiers de l'export
export function toSnakeCase(name: string): string {
	return name.replaceAll(/[A-Z]/gu, (letter) => `_${letter.toLowerCase()}`);
}
