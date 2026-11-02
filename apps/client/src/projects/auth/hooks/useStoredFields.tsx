import { useSessionStorage } from "@citadel/common/src/react/hooks/useSessionStorage";
import { useCallback } from "react";

/**
 * Les champs d'un formulaire du compte, gardés le temps de l'onglet : recharger la page, ou revenir de la boîte mail,
 * ne les perd jamais. Jamais un mot de passe : ceux-là restent dans l'état du composant
 */
export function useStoredFields<Fields extends object>(
	key: string,
	emptyFields: Fields,
) {
	const { value, set, remove } = useSessionStorage<Fields>(key, emptyFields);
	const fields = { ...emptyFields, ...value };

	const update = useCallback(
		<Field extends keyof Fields>(field: Field, fieldValue: Fields[Field]) => {
			set({ ...emptyFields, ...value, [field]: fieldValue });
		},
		[emptyFields, set, value],
	);

	return { fields, update, clear: remove };
}
