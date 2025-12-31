import React from "react";

import { TranslationsFilesEnum as TF } from "../../../enums/translationsFile.enum";
import { itemPerMinute } from "../../../helpers/itemPerMinute.helper";
import { useCombinedStore } from "../../../store/combined.store";
import type { ItemsInOutType } from "../../../types/satisfactory/itemsInOut.type";
import { useCustomTranslations } from "../../hooks/useCustomTranslations";
import styles from "./styles.module.scss";

type Props = {
	resource: ItemsInOutType;
	cycleDuration: number;
};

export function ResourceBox({
	resource,
	cycleDuration,
}: Props): React.JSX.Element {
	const t = useCustomTranslations();

	const minuteCalculation = useCombinedStore(
		(state) => state.minuteCalculation,
	);

	const getItemCount = (cycleItemCount: number) => {
		if (!minuteCalculation) return cycleItemCount;
		return itemPerMinute({ cycleDuration, cycleItemCount });
	};

	return (
		<div
			key={resource.item.name}
			className={styles.resource_in_out}
		>
			<img
				className={styles.resource_icon}
				alt={`Icon of ${t(TF.SATISFACTORY_ITEMS, resource.item.name)} satisfactory resource`}
				src={
					new URL(
						`/src/projects/satisfactory/assets/images/satisfactory/gameItems/Resource/${resource.item.name}.png`,
						import.meta.url,
					).href
				}
			/>
			<p className={styles.resource_count}>
				{getItemCount(resource.quantityPerCycle)}
			</p>
		</div>
	);
}
