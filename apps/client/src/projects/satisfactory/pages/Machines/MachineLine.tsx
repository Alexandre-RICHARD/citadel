import { roundNumber } from "../../../../common/helpers/number/roundNumber";
import type { DisplayableMachines } from "./DisplayableMachines.type";
import styles from "./machines.module.scss";

type Props = {
	machines: DisplayableMachines[];
};

export function MachineLine({ machines }: Props) {
	const ping = (x: number, y: number, z: number) => {
		fetch("http://localhost:8080/createPing", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-FRM-Authorization": "FByFeezLKIybEuH6uoKvuTyIWpUT19HN",
			},
			body: JSON.stringify({
				x,
				y,
				z,
			}),
		}).catch((error) => console.error(error));
	};

	return machines.map((oneMachine) => {
		return (
			<tr key={oneMachine.id}>
				<td>{oneMachine.name}</td>
				<td>{roundNumber(oneMachine.overclocking, 2)} %</td>
				<td>{roundNumber(oneMachine.efficiency, 2)} %</td>
				<td>
					{oneMachine.powerConsumption
						? roundNumber(oneMachine.powerConsumption, 2)
						: "N/A"}{" "}
					Mw
				</td>
				<td>
					{oneMachine.powerProduction
						? roundNumber(oneMachine.powerProduction, 2)
						: "N/A"}{" "}
					Mw
				</td>
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
	});
}
