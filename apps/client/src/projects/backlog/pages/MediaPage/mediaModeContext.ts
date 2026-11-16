import { createContext } from "react";

import { mediaTable } from "../../helper/view/mediaTable";
import type { MediaMode } from "./mediaMode.type";

// Lu par les cellules et les hooks des saisons : le mode classique par défaut
export const MediaModeContext = createContext<MediaMode>({
	table: mediaTable,
	nas: null,
});
