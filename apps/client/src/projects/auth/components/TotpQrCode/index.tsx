import { encode } from "uqr";

import { buildQrCodePath } from "../../helper/qr/buildQrCodePath";
import styles from "./totpQrCode.module.scss";

type Props = {
	// L'adresse otpauth:// du facteur : le secret y est, elle ne quitte pas le navigateur
	otpauthUri: string;
};

// Quatre modules de marge, comme l'exige la norme : sans elle, certaines applications ne lisent pas le code
const QUIET_ZONE = 4;

// Le QR code d'un TOTP, dessiné ici même : à scanner avec l'application d'authentification
export function TotpQrCode({ otpauthUri }: Props) {
	const { data, size } = encode(otpauthUri, { ecc: "M", border: 0 });
	const fullSize = size + QUIET_ZONE * 2;

	return (
		<svg
			className={styles.qrCode}
			viewBox={`0 0 ${fullSize} ${fullSize}`}
			role="img"
			aria-label="QR code à scanner avec votre application d’authentification"
			shapeRendering="crispEdges"
		>
			<rect
				width={fullSize}
				height={fullSize}
				fill="#fff"
			/>
			<path
				transform={`translate(${QUIET_ZONE} ${QUIET_ZONE})`}
				d={buildQrCodePath(data)}
				fill="#000"
			/>
		</svg>
	);
}
