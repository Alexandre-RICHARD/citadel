import React from "react";

import { TranslationsFilesEnum as TF } from "../../../enums/translationsFile.enum";
import { roundNumber } from "../../../nexus/helpers/data/number/roundNumber.helper";
import { useCombinedStore } from "../../../store/combined.store";
import { useCustomTranslations } from "../../hooks/useCustomTranslations";
import styles from "./styles.module.scss";

export function GraphSummary(): React.JSX.Element | null {
	const t = useCustomTranslations();
	const factoryLineData = useCombinedStore((state) => state.factoryLineData)!;

	return (
		<div className={styles.graph_summary_container}>
			<p>{roundNumber(factoryLineData.totalPowerRequired, 2)} Mw</p>
			<p>{roundNumber(factoryLineData.totalEnergyRequired, 2)} Mj</p>
			{factoryLineData.rawResources?.map((rawResource) => (
				<p>
					{t(TF.SATISFACTORY_ITEMS, rawResource.item.name)}
					{" - "}
					{rawResource.quantityPerMinute} / min
				</p>
			))}
		</div>
	);
}
