import "./styles/reset.scss";
import "./styles/global.scss";

import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { tanStackQueryClient } from "./configuration/tanStackQueryClient";
import { router } from "./projects/appNavigation/routes";

createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={tanStackQueryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</React.StrictMode>,
);
