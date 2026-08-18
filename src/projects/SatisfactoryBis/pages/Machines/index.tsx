import { writeCountdown } from "../../../../common/helpers/date/writeCountdown";
import { formatNumberWithSpaces } from "../../../../common/helpers/number/formatNumberWithSpaces";
import { roundNumber } from "../../../../common/helpers/number/roundNumber";
import { useGetAllMachines } from "../../actions/useGetAllMachines/useGetAllMachines";
import type { AwesomeSinkFm } from "../../actions/useGetAwesomeSink/awesomeSinkFm.type";
import { useGetAwesomeSink } from "../../actions/useGetAwesomeSink/useGetAwesomeSink";
import { MachineLine } from "./MachineLine";
import styles from "./machines.module.scss";
import { useMachines } from "./useMachines";

function getCouponLevelCost(level: number): number {
	const ceil = Math.ceil(level / 3) - 1;

	if (ceil === 0) return 500;

	const calculatorIndex = Math.min(ceil, 999);

	const base = calculatorIndex ** 2;
	return 250 * base + 1000;
}

function getSumOfCouponLevelCost(startIndex: number, endIndex: number): number {
	let total = 0;

	for (let i = startIndex; i <= endIndex; i += 1) {
		total += getCouponLevelCost(i);
	}

	return total;
}

function getGoldenNutInfo(awesomeSink: AwesomeSinkFm): {
	totalCostRemainingToGetGoldenNut: string;
	timeRemaining: string;
} {
	const goldenNutPrice = 1000;
	const couponRemainingNeeded = goldenNutPrice - awesomeSink.availableCoupons;

	const resourceGraphValues = awesomeSink.Resource?.graphValues ?? [];
	const resourceAverageSpeedPerMinute =
		resourceGraphValues.length > 0
			? resourceGraphValues.reduce((acc, value) => acc + value, 0) /
				resourceGraphValues.length
			: 0;

	const progressionPurcent = awesomeSink.Resource?.progressionPurcent ?? 0;
	const remainingPointsToNextCoupon =
		awesomeSink.Resource?.remainingPointsToNextCoupon ?? 0;
	const currentLevelCost =
		remainingPointsToNextCoupon / (1 - progressionPurcent);
	const currentLevel =
		Math.round(3 * Math.sqrt((Math.ceil(currentLevelCost) - 1000) / 250)) + 1;

	const goalLevel = currentLevel + couponRemainingNeeded;
	const totalCostRemainingToGetGoldenNut =
		getSumOfCouponLevelCost(currentLevel, goalLevel) -
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
				<label
					className={styles.inputCheckboxContainer}
					htmlFor="onlyNonFullEfficentCheckbox"
				>
					Uniquement les non efficient
					<input
						checked={onlyNonFullEfficent}
						id="onlyNonFullEfficentCheckbox"
						className={styles.inputCheckbox}
						type="checkbox"
						onChange={() => setOnlyNonFullEfficent(!onlyNonFullEfficent)}
					/>
				</label>
				<label
					className={styles.inputCheckboxContainer}
					htmlFor="removedHubBiomassGenerators"
				>
					Ignorer les brûleurs de biomasse du HUB
					<input
						checked={removedHubBiomassGenerators}
						id="removedHubBiomassGenerators"
						className={styles.inputCheckbox}
						type="checkbox"
						onChange={() =>
							setRemovedHubBiomassGenerators(!removedHubBiomassGenerators)
						}
					/>
				</label>
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
