import "./styles/reset.scss";
import "./styles/global.scss";

import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { tanStackQueryClient } from "./configuration/tanStackQueryClient.ts";
import { router } from "./react/appNavigation/routes.ts";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={tanStackQueryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</StrictMode>,
);
