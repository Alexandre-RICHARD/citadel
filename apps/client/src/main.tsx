import "@citadel/design-system/src/styles/reset.scss";
import "@citadel/design-system/src/styles/global.scss";

import { defaultTheme } from "@citadel/design-system/src/theme/defaultTheme";
import { ThemeProvider } from "@citadel/design-system/src/theme/ThemeProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { tanStackQueryClient } from "./configuration/tanStackQueryClient";
import { ProjectTransition } from "./react/appNavigation/projectTransition/ProjectTransition";
import { router } from "./react/appNavigation/routes";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider theme={defaultTheme}>
			<QueryClientProvider client={tanStackQueryClient}>
				<RouterProvider router={router} />
				{/* Hors du routeur : le rideau des transitions survit au changement de page */}
				<ProjectTransition />
			</QueryClientProvider>
		</ThemeProvider>
	</StrictMode>,
);
