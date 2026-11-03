import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import { totpService } from "../../../projects/auth/service/totpService.ts";
import { computeHotp } from "../../../projects/auth/totp/computeHotp.ts";
import { computeTotpStep } from "../../../projects/auth/totp/computeTotpStep.ts";
import { TOTP_PARAMETERS } from "../../../projects/auth/totp/totpParameters.ts";
import { insertAuthRows } from "./insertAuthRows.ts";

type Options = {
	userId: number;
	// Par défaut, actif ; null : il attend son premier code
	confirmedAt?: Date | null;
	createdAt?: Date;
	lastUsedStep?: number | null;
};

type TestTotpFactor = {
	factorId: number;
	secret: Buffer;
	// Le code que l'application donnerait, à `stepOffset` pas de l'instant présent (horloge figée comprise)
	codeAt: (stepOffset?: number) => string;
	// Le pas de l'instant présent
	currentStep: () => number;
};

function currentStep(): number {
	return computeTotpStep(Date.now(), TOTP_PARAMETERS.periodSeconds);
}

// Un TOTP au secret chiffré comme le ferait le service, dont le test connaît le secret pour en calculer les codes
export async function insertTestTotpFactor({
	userId,
	confirmedAt = new Date(),
	createdAt = new Date(),
	lastUsedStep = null,
}: Options): Promise<TestTotpFactor> {
	const secret = totpService.createSecret();
	const factorId = await insertAuthRows.factor({
		userId,
		type: "totp",
		confirmedAt,
		createdAt,
	});
	const { secretEncrypted, keyVersion } = totpService.encrypt(secret, factorId);
	await sequelize.query(
		`UPDATE auth_factor SET secret_encrypted = :secretEncrypted, key_version = :keyVersion,
			last_used_step = :lastUsedStep
		WHERE id = :factorId`,
		{
			type: QueryTypes.UPDATE,
			replacements: { factorId, secretEncrypted, keyVersion, lastUsedStep },
		},
	);
	return {
		factorId,
		secret,
		codeAt: (stepOffset = 0) =>
			computeHotp(secret, currentStep() + stepOffset, TOTP_PARAMETERS.digits),
		currentStep,
	};
}
