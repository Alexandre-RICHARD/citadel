import { type Response, Router } from "express";

import type { MediaReportResponse } from "../../shared/mediaReportResponse.type.ts";
import { readMediaReport } from "./readMediaReport.ts";

// Le rapport du job media-sync, pour sa carte de l'accueil et sa page (/media). Lecture seule : rien ne s'y supprime
export const mediaReportRouter = Router();

mediaReportRouter.get(
	"/api/media-report",
	async (_request, response: Response<MediaReportResponse>) => {
		response.json({ report: await readMediaReport() });
	},
);
