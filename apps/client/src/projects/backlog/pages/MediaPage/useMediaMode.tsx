import { useContext } from "react";

import type { MediaMode } from "./mediaMode.type";
import { MediaModeContext } from "./mediaModeContext";

export function useMediaMode(): MediaMode {
	return useContext(MediaModeContext);
}
