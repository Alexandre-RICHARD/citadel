import { isEqualInConstantTime } from "@citadel/common/src/node/crypto/isEqualInConstantTime.ts";

import { computeHotp } from "./computeHotp.ts";
import { computeTotpStep } from "./computeTotpStep.ts";

type TotpCheck = {
	secret: Buffer;
	code: string;
	nowMs: number;
	// Pas du dernier code accepté pour ce secret ; null : aucun encore
	lastUsedStep: number | null;
	digits: number;
	periodSeconds: number;
	// Pas acceptés de part et d'autre du pas actuel : l'horloge du téléphone peut avancer ou retarder
	driftSteps: number;
};

// Le pas actuel d'abord, puis de plus en plus loin, avant puis après
function listCandidateSteps(currentStep: number, driftSteps: number): number[] {
	const steps = [currentStep];
	for (let distance = 1; distance <= driftSteps; distance += 1)
		steps.push(currentStep - distance, currentStep + distance);
	return steps;
}

/**
 * Le pas de temps dont le code tapé est le TOTP (RFC 6238), ou null. Anti-rejeu : un pas déjà utilisé, ou plus ancien,
 * ne passe plus, même pendant les 30 à 90 secondes où son code reste valable. Chaque code est comparé en temps constant
 */
export function findAcceptedTotpStep({
	secret,
	code,
	nowMs,
	lastUsedStep,
	digits,
	periodSeconds,
	driftSteps,
}: TotpCheck): number | null {
	const typedCode = Buffer.from(code, "utf8");
	const candidateSteps = listCandidateSteps(
		computeTotpStep(nowMs, periodSeconds),
		driftSteps,
	).filter(
		(step) => step >= 0 && (lastUsedStep === null || step > lastUsedStep),
	);
	for (const step of candidateSteps) {
		const expectedCode = Buffer.from(computeHotp(secret, step, digits), "utf8");
		if (isEqualInConstantTime(typedCode, expectedCode)) return step;
	}
	return null;
}
