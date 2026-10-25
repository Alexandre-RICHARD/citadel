import "@citadel/design-system/src/styles/reset.scss";
import "./styles/global.scss";

import { ThemeProvider } from "@citadel/design-system/src/theme/ThemeProvider";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { adminTheme } from "./adminTheme";
import { App } from "./components/App";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider theme={adminTheme}>
			<App />
		</ThemeProvider>
	</StrictMode>,
);
