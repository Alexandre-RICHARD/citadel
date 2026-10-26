import styles from "../../../../backlog.module.scss";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";

// Teinte de la note : vert à partir de 16, sarcelle à 12, ambre à 8, rouge en dessous
function getRatingTone(rating: number): string | undefined {
	if (rating >= 16) return styles.toneGreen;
	if (rating >= 12) return styles.toneTeal;
	if (rating >= 8) return styles.toneAmber;
	return styles.toneRed;
}

// Note sur 20, teintée
export function RatingBadge({ rating }: { rating: number }) {
	return (
		<span className={joinClassNames(styles.rating, getRatingTone(rating))}>
			{rating}
			<span className={styles.ratingScale}>/20</span>
		</span>
	);
}
