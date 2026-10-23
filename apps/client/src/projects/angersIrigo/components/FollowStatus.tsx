/* eslint-disable citadel/component-folder-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import "./FollowStatus.scss";

import type { JSX } from "react";

import type { Vehicle } from "../types/vehicle";
import { getLineLabel } from "../utils/vehicles";
import { LineBadge } from "./LineBadge";

type FollowStatusProps = {
	/** Véhicule suivi ; undefined s'il n'est plus affiché */
	vehicle?: Vehicle | undefined;
	onStop: () => void;
};

/** Bandeau en bas de la carte pendant le suivi d'un véhicule, avec de quoi l'arrêter */
export function FollowStatus({
	vehicle,
	onStop,
}: FollowStatusProps): JSX.Element {
	return (
		<div
			className="follow-status"
			role="status"
		>
			{vehicle ? (
				<>
					<LineBadge
						label={getLineLabel(vehicle)}
						color={vehicle.route?.color}
						textColor={vehicle.route?.textColor}
					/>
					<span className="follow-status__text">
						Suivi{" "}
						<span className="follow-status__destination">
							{vehicle.destination
								? `→ ${vehicle.destination}`
								: (vehicle.route?.longName ?? "Ligne inconnue")}
						</span>
					</span>
				</>
			) : (
				<span className="follow-status__text">
					Véhicule suivi introuvable pour l&apos;instant
				</span>
			)}
			<button
				type="button"
				className="follow-status__stop"
				aria-label="Arrêter le suivi"
				onClick={onStop}
			>
				×
			</button>
		</div>
	);
}
