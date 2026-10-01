import "@citadel/design-system/src/styles/reset.scss";
import "@citadel/design-system/src/styles/global.scss";

import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { tanStackQueryClient } from "./configuration/tanStackQueryClient";
import { router } from "./react/appNavigation/routes";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={tanStackQueryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</StrictMode>,
);
