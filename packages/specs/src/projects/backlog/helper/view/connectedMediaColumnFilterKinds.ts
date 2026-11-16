import type { ColumnFilterKinds } from "./columnFilterKinds.type.ts";
import type { ConnectedMediaColumn } from "./connectedMediaColumn.type.ts";
import { mediaColumnFilterKinds } from "./mediaColumnFilterKinds.ts";
import { nasColumnFilterKinds } from "./nasColumnFilterKinds.ts";

// Sorte de filtre de chaque colonne du tableau en mode connecté : celles du mode classique, puis celles du NAS
export const connectedMediaColumnFilterKinds: ColumnFilterKinds<ConnectedMediaColumn> =
	{
		...mediaColumnFilterKinds,
		...nasColumnFilterKinds,
	};
