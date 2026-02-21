export function SatisfactoryMachines() {
	const [onlyNonFullEfficent, setOnlyNonFullEfficent] = useState(false);
	const [removedHubBiomassGenerators, setRemovedHubBiomassGenerators] =
		useState(false);

	const allMachines = useGetAllMachines();

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
