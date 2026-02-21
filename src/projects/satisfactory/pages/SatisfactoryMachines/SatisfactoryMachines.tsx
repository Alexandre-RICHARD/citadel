/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo, useState } from "react";

import { writeCountdown } from "../../../../common/helpers/date/writeCountdown";
import { formatNumberWithSpaces } from "../../../../common/helpers/number/formatNumberWithSpaces";
import { roundNumber } from "../../../../common/helpers/number/roundNumber";
import { useGetAllMachines } from "../../actions/useGetAllMachines/useGetAllMachines";
import type { AwesomeSinkFm } from "../../actions/useGetAwesomeSink/awesomeSinkFm.type";
import { useGetAwesomeSink } from "../../actions/useGetAwesomeSink/useGetAwesomeSink";
import { GameClassNamesEnum } from "../../enums/gameClassNames.enum";
import styles from "./SatisfactoryMachines.module.scss";

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

export function SatisfactoryMachines() {
	const [onlyNonFullEfficent, setOnlyNonFullEfficent] = useState(false);
	const [removedHubBiomassGenerators, setRemovedHubBiomassGenerators] =
		useState(false);

	const allMachines = useGetAllMachines();
	const awesomeSink = useGetAwesomeSink();
	const goldenNutInfo = getGoldenNutInfo(awesomeSink);

	const firstFilterMachines = allMachines.filter((machine) => {
		const machineType = machine.className;
		if (
			machineType === GameClassNamesEnum.Build_GeneratorIntegratedBiomass_C &&
			removedHubBiomassGenerators
		)
			return false;
		return true;
	});

	const ping = (x: number, y: number, z: number) => {
		fetch("http://localhost:8080/createPing", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-FRM-Authorization": "WtnMighIqufSUyvmvYWIob0OHTrkiRNX",
			},
			body: JSON.stringify({
				x,
				y,
				z,
			}),
		}).catch((error) => console.error(error));
	};

	const filteredData = useMemo(() => {
		return firstFilterMachines.filter((oneMachine) => {
			const efficientFilter = (): boolean => {
				if (!onlyNonFullEfficent) return true;
				if ("powerConsumption" in oneMachine)
					return oneMachine.efficiency !== 100;
				if ("powerProduction" in oneMachine) return !oneMachine.isAtFullSpeed;
				return false;
			};
			return !!efficientFilter();
		});
	}, [firstFilterMachines, onlyNonFullEfficent]);

	const totalMachinesEfficencies = firstFilterMachines.reduce<number>(
		(acc, machine) => {
			if ("powerProduction" in machine) {
				return acc + (machine.isAtFullSpeed ? 100 : 0);
			}
			return acc + machine.efficiency;
		},
		0,
	);
	const averageEfficiency = firstFilterMachines.length
		? totalMachinesEfficencies / firstFilterMachines.length
		: undefined;

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
						onChange={() => setOnlyNonFullEfficent((prev) => !prev)}
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
						onChange={() => setRemovedHubBiomassGenerators((prev) => !prev)}
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
						{filteredData.map((oneMachine) => {
							if ("powerConsumption" in oneMachine) {
								return (
									<tr key={oneMachine.id}>
										<td>{oneMachine.name}</td>
										<td>{roundNumber(oneMachine.overclocking, 2)} %</td>
										<td>{roundNumber(oneMachine.efficiency, 2)} %</td>
										<td>{roundNumber(oneMachine.powerConsumption, 2)} Mw</td>
										<td>N/A</td>
										<td
											className={styles.locationPingButton}
											onClick={() => {
												ping(
													oneMachine.location.x,
													oneMachine.location.y,
													oneMachine.location.z,
												);
											}}
										>{`${roundNumber(oneMachine.location.x / 100, 2)}, ${roundNumber(oneMachine.location.y / 100, 2)}`}</td>
									</tr>
								);
							}

							if ("powerProduction" in oneMachine) {
								return (
									<tr key={oneMachine.id}>
										<td>{oneMachine.name}</td>
										<td>{roundNumber(oneMachine.overclocking, 2)} %</td>
										<td>{oneMachine.isAtFullSpeed ? "100 %" : "0 %"}</td>
										<td>N/A</td>
										<td>{roundNumber(oneMachine.powerProduction, 2)} Mw</td>
										<td
											className={styles.locationPingButton}
											onClick={() => {
												ping(
													oneMachine.location.x,
													oneMachine.location.y,
													oneMachine.location.z,
												);
											}}
										>{`${roundNumber(oneMachine.location.x / 100, 2)}, ${roundNumber(oneMachine.location.y / 100, 2)}`}</td>
									</tr>
								);
							}
							return null;
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
