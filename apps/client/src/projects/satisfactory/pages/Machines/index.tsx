import { writeCountdown } from "@citadel/common/src/universal/date/writeCountdown";
import { average } from "@citadel/common/src/universal/number/average";
import { formatNumberWithSpaces } from "@citadel/common/src/universal/number/formatNumberWithSpaces";
import { roundNumber } from "@citadel/common/src/universal/number/roundNumber";
import { CheckboxInput } from "@citadel/design-system/src/atoms/CheckboxInput";

import { useGetAllMachines } from "../../api/useGetAllMachines/useGetAllMachines";
import type { AwesomeSinkFm } from "../../api/useGetAwesomeSink/awesomeSinkFm.type";
import { useGetAwesomeSink } from "../../api/useGetAwesomeSink/useGetAwesomeSink";
import { getCouponLevelsCost } from "../../helper/awesomeSink/getCouponLevelsCost";
import { MachineLine } from "./MachineLine";
import styles from "./machines.module.scss";
import { useMachines } from "./useMachines";

function getGoldenNutInfo(awesomeSink: AwesomeSinkFm): {
	totalCostRemainingToGetGoldenNut: string;
	timeRemaining: string;
} {
	const goldenNutPrice = 1000;
	const couponRemainingNeeded = goldenNutPrice - awesomeSink.availableCoupons;

	const resourceAverageSpeedPerMinute =
		average(awesomeSink.Resource?.graphValues ?? []) ?? 0;

	const progressionPurcent = awesomeSink.Resource?.progressionPurcent ?? 0;
	const remainingPointsToNextCoupon =
		awesomeSink.Resource?.remainingPointsToNextCoupon ?? 0;
	const currentLevelCost =
		remainingPointsToNextCoupon / (1 - progressionPurcent);
	const currentLevel =
		Math.round(3 * Math.sqrt((Math.ceil(currentLevelCost) - 1000) / 250)) + 1;

	const goalLevel = currentLevel + couponRemainingNeeded;
	const totalCostRemainingToGetGoldenNut =
		getCouponLevelsCost(currentLevel, goalLevel) -
		(currentLevelCost - remainingPointsToNextCoupon);

	return {
		totalCostRemainingToGetGoldenNut: formatNumberWithSpaces(
			roundNumber(totalCostRemainingToGetGoldenNut, 0),
		),
		timeRemaining: writeCountdown(
			(totalCostRemainingToGetGoldenNut / resourceAverageSpeedPerMinute) *
				60 *
				1000,
			"HHMMSS",
		),
	};
}

export function Machines() {
	const allMachines = useGetAllMachines();
	const awesomeSink = useGetAwesomeSink();
	const goldenNutInfo = getGoldenNutInfo(awesomeSink);

	const {
		machines,
		averageEfficiency,
		onlyNonFullEfficent,
		setOnlyNonFullEfficent,
		removedHubBiomassGenerators,
		setRemovedHubBiomassGenerators,
	} = useMachines({
		allMachines,
	});

	return (
		<div>
			<div className={styles.machinesContainer}>
				<CheckboxInput
					id="onlyNonFullEfficentCheckbox"
					label="Uniquement les non efficient"
					value={onlyNonFullEfficent}
					onChange={setOnlyNonFullEfficent}
				/>
				<CheckboxInput
					id="removedHubBiomassGenerators"
					label="Ignorer les brûleurs de biomasse du HUB"
					value={removedHubBiomassGenerators}
					onChange={setRemovedHubBiomassGenerators}
				/>
				<p>
					Moyenne d&apos;efficacité :{" "}
					{averageEfficiency ? `${roundNumber(averageEfficiency, 2)} %` : "//"}
				</p>
				<p>
					Points restant avant d&apos;obtenir la noix dorée :{" "}
					{goldenNutInfo?.totalCostRemainingToGetGoldenNut}
				</p>
				<p>
					Temps restant avant d&apos;obtenir la noix dorée :{" "}
					{goldenNutInfo?.timeRemaining}
				</p>
				<table className={styles.machinesTable}>
					<thead className={styles.tableHeader}>
						<tr>
							<th>Name</th>
							<th>Overclocking</th>
							<th>Efficiency</th>
							<th>Power Consumption</th>
							<th>Power Production</th>
							<th>Location</th>
						</tr>
					</thead>
					<tbody className={styles.tableBody}>
						<MachineLine machines={machines} />
					</tbody>
				</table>
			</div>
		</div>
	);
}
