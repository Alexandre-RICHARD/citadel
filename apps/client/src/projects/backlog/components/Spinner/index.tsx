import { LoaderCircle } from "lucide-react";

import { joinClassNames } from "../../utils";
import styles from "./spinner.module.scss";

/** Roue de chargement, décorative : le texte qui l'accompagne dit ce qui charge */
export function Spinner({ className }: { className?: string | undefined }) {
	return (
		<LoaderCircle
			className={joinClassNames(styles.spinner, className)}
			aria-hidden
		/>
	);
}
