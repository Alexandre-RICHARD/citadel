import { SecondFactorMethodEnum } from "@citadel/specs/src/projects/auth/enum/secondFactorMethod.enum";
import { LifeBuoy, type LucideIcon, Mail, Smartphone } from "lucide-react";
import { useId } from "react";

import styles from "./secondFactorMethodPicker.module.scss";

type Props = {
	methods: readonly SecondFactorMethodEnum[];
	value: SecondFactorMethodEnum;
	onChange: (method: SecondFactorMethodEnum) => void;
	// Grisée, mais visible : le code par email quand plus aucun email ne part aujourd'hui
	disabledMethods: readonly SecondFactorMethodEnum[];
};

const METHOD_OPTIONS: Record<
	SecondFactorMethodEnum,
	{ label: string; icon: LucideIcon }
> = {
	[SecondFactorMethodEnum.TOTP]: { label: "Application", icon: Smartphone },
	[SecondFactorMethodEnum.EMAIL]: { label: "Code par email", icon: Mail },
	[SecondFactorMethodEnum.RECOVERY_CODE]: {
		label: "Code de secours",
		icon: LifeBuoy,
	},
};

// Ce qui prouve le second facteur, au choix : de vrais boutons radio, les flèches passent d'une méthode à l'autre
export function SecondFactorMethodPicker({
	methods,
	value,
	onChange,
	disabledMethods,
}: Props) {
	const name = useId();

	return (
		<div
			role="radiogroup"
			aria-label="Méthode de vérification"
			className={styles.group}
		>
			{methods.map((method) => {
				const { label, icon: Icon } = METHOD_OPTIONS[method];
				return (
					<label
						key={method}
						className={styles.option}
						data-selected={method === value}
					>
						<input
							type="radio"
							className={styles.input}
							name={name}
							value={method}
							checked={method === value}
							disabled={disabledMethods.includes(method)}
							onChange={() => onChange(method)}
						/>
						<Icon aria-hidden />
						{label}
					</label>
				);
			})}
		</div>
	);
}
