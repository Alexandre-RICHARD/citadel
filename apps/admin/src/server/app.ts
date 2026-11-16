import path from "node:path";

import express from "express";

import { authRouter } from "./auth/authRouter.ts";
import { requireSameOrigin } from "./auth/requireSameOrigin.ts";
import { requireSession } from "./auth/requireSession.ts";
import { errorHandler } from "./http/errorHandler.ts";
import { HttpError } from "./http/HttpError.ts";
import { securityHeaders } from "./http/securityHeaders.ts";
import { jobsRouter } from "./jobs/jobsRouter.ts";
import { mediaReportRouter } from "./mediaReport/mediaReportRouter.ts";
import { operationsRouter } from "./operations/operationsRouter.ts";
import { overviewRouter } from "./overviewRouter.ts";
import { requestsRouter } from "./requests/requestsRouter.ts";
import { servicesRouter } from "./services/servicesRouter.ts";

// Le front construit par Vite (build/public), à côté du serveur dans l'image
const PUBLIC_DIR = path.join(process.cwd(), "build", "public");

export const app = express();
app.disable("x-powered-by");
app.disable("etag");

app.use(securityHeaders);
app.use(express.json({ limit: "10kb" }));

// Pour le healthcheck de Docker : sans session, ne dit rien d'autre que « vivant »
app.get("/health", (_request, response) => {
	response.type("text/plain").send("ok");
});

app.use("/api", requireSameOrigin);
app.use(authRouter);
app.use("/api", requireSession);
app.use(servicesRouter);
app.use(overviewRouter);
app.use(jobsRouter);
app.use(requestsRouter);
app.use(operationsRouter);
app.use(mediaReportRouter);
app.use("/api", () => {
	throw new HttpError(404, "Route inconnue");
});

// Le front : une seule page. Ses fichiers changent de nom à chaque build (hachage) : ils
// peuvent rester en cache ; index.html, jamais (il pointe vers les fichiers du moment).
app.use(
	express.static(PUBLIC_DIR, {
		setHeaders(response, filePath) {
			response.setHeader(
				"Cache-Control",
				filePath.endsWith(".html")
					? "no-cache"
					: "public, max-age=31536000, immutable",
			);
		},
	}),
);

// La page du rapport des médias (/media), où mène aussi le backlog en mode connecté : la même page, que le front
// choisit d'après l'adresse
app.get("/media", (_request, response) => {
	response.setHeader("Cache-Control", "no-cache");
	response.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.use(errorHandler);
