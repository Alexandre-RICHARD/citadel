import { regexDictionary } from "@citadel/common/src/universal/regex/regexDictionary.ts";

/**
 * Condition SQL de « Ma base », et son motif : les jeux hors backlog dont le nom VO, le nom VF ou
 * un titre de version contient la saisie. La collation ignore accents et majuscules ; les % et _ tapés restent du texte
 */
export function buildOutsideBacklogFilter(query: string): {
	condition: string;
	pattern: string;
} {
	const escapedQuery = query.replace(
		regexDictionary.sqlLikeWildcard,
		(character) => `\\${character}`,
	);
	return {
		condition: `
			NOT EXISTS (SELECT 1 FROM backlog_user_game ug WHERE ug.game_id = g.id)
			AND (
				g.name LIKE :pattern
				OR g.french_name LIKE :pattern
				OR EXISTS (
					SELECT 1 FROM backlog_version tv
					WHERE tv.game_id = g.id AND tv.title LIKE :pattern
				)
			)
		`,
		pattern: `%${escapedQuery}%`,
	};
}
