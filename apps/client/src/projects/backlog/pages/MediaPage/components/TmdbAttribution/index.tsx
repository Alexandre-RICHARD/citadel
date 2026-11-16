import { externalLinks } from "@citadel/specs/src/links/externalLinks";

import mediaStyles from "../../../../media.module.scss";

// Attribution demandée par TMDB à qui utilise son API : sa source, et qu'il n'approuve pas le site
export function TmdbAttribution() {
	return (
		<p className={mediaStyles.attribution}>
			Titres, dates, durées et images des films et séries viennent de{" "}
			<a
				href={externalLinks.tmdb}
				target="_blank"
				rel="noreferrer"
			>
				The Movie Database (TMDB)
			</a>
			. Ce site utilise l’API de TMDB, sans être approuvé ni certifié par TMDB.
		</p>
	);
}
