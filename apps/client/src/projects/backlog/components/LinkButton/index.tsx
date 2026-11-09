import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";

import buttonStyles from "../Button/button.module.scss";
import type { PopoverPlacement } from "../Popover/popoverPlacement.type";
import { Tooltip } from "../Tooltip";

type Props = {
	/** Destination : un vrai lien, donc nouvel onglet, clic molette et copie de l'adresse fonctionnent */
	to: string;
	icon: LucideIcon;
	/** Nom du lien, qui n'a que son icône */
	ariaLabel: string;
	tooltip?: string;
	tooltipPlacement?: PopoverPlacement;
};

/** Lien-icône discret, de la même allure qu'un `Button` ghost : pour une page plutôt qu'une action */
export function LinkButton({
	to,
	icon: Icon,
	ariaLabel,
	tooltip,
	tooltipPlacement = "top",
}: Props) {
	return (
		<Tooltip
			content={tooltip}
			placement={tooltipPlacement}
		>
			<Link
				to={to}
				className={joinClassNames(
					buttonStyles.button,
					buttonStyles.ghost,
					buttonStyles.md,
					buttonStyles.iconOnly,
				)}
				aria-label={ariaLabel}
			>
				<Icon
					className={buttonStyles.icon}
					aria-hidden
				/>
			</Link>
		</Tooltip>
	);
}
