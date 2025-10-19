import type { ReactNode } from "react";

import { Button } from "../button/Button";
import { CacheOverlay } from "../cacheOverlay/CacheOverlay";

type Props = {
	children: ReactNode;
	onClose: () => void;
	onSubmit: () => void;
};

export function Modal({ children, onClose, onSubmit }: Props) {
	return (
		<CacheOverlay>
			<div
				style={{
					backgroundColor: "white",
					padding: "1rem",
					display: "flex",
					flexDirection: "column",
					gap: "0.5rem",
				}}
			>
				{children}
				<div style={{ display: "flex", justifyContent: "space-between" }}>
					<Button
						label="Fermer la modal"
						onClick={onClose}
					/>
					<Button
						label="Valider"
						onClick={onSubmit}
					/>
				</div>
			</div>
		</CacheOverlay>
	);
}
