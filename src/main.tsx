import "./styles/reset.scss";
import "./styles/global.scss";

import { QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { tanStackQueryClient } from "./configuration/tanStackQueryClient";
import { router } from "./routing/routes";

createRoot(document.getElementById("root")!).render(
	<QueryClientProvider client={tanStackQueryClient}>
		<RouterProvider router={router} />
	</QueryClientProvider>,
);
