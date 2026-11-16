import { NasGapKindEnum } from "@citadel/specs/src/projects/backlog/enum/nasGapKind.enum";
import { ShieldCheck } from "lucide-react";

import { useLoadShowSeasons } from "../../../../api/media/useLoadShowSeasons";
import type { NasDetailsFm } from "../../../../api/model/nas/nasDetailsFm.type";
import { useSetMediaVerified } from "../../../../api/nas/useSetMediaVerified";
import styles from "../../../../backlog.module.scss";
import { Checkbox } from "../../../../components/Checkbox";
import { planVerifiedChange } from "../../../../helper/nas/planVerifiedChange";
import type { VerifiedTarget } from "../../../../helper/nas/verifiedTarget.type";
import mediaStyles from "../../../../media.module.scss";
import nasStyles from "../../../../nas.module.scss";
import type { MediaTableControls } from "../../mediaTableControls.type";

type Props = {
	userMediaId: number;
	title: string;
	// null : la case d'un film ; sinon celle de la série, d'une saison ou d'un épisode
	target: VerifiedTarget | null;
	// Ce que nomme la case dans un dialogue : « la série », « Saison 2 », « l'épisode 3 »
	subject: string;
	nas: NasDetailsFm | null;
	isDisabled: boolean;
	table: MediaTableControls;
};

// Pourquoi la case ne se coche pas ; null quand elle se coche
function getDisabledReason(nas: NasDetailsFm): string | null {
	if (nas.verifiableCount > 0) return null;
	if (nas.gaps.some(({ kind }) => kind === NasGapKindEnum.DUPLICATE))
		return "Plusieurs fichiers : à régler avant de vérifier";
	return "Aucun fichier à vérifier";
}

/**
 * Case « Vérifié » (§5) : vous avez lancé le fichier, c'est le bon. Elle se garde sur le NAS, avec l'empreinte du
 * fichier : un fichier remplacé ne l'est plus. Une série ou une saison se coche en cascade sur ses épisodes, avec un
 * dialogue dès que plus d'un change
 */
export function VerifiedCell({
	userMediaId,
	title,
	target,
	subject,
	nas,
	isDisabled,
	table,
}: Props) {
	const setMediaVerified = useSetMediaVerified(userMediaId);
	const loadShowSeasons = useLoadShowSeasons(true);
	if (nas === null) return null;
	const isVerified =
		nas.verifiableCount > 0 && nas.verifiedCount === nas.verifiableCount;
	const isGroup = nas.episodeCount !== null;
	const progressText =
		isGroup && !isVerified && nas.verifiableCount > 0 ? (
			<span className={mediaStyles.progress}>
				{nas.verifiedCount} / {nas.verifiableCount}
			</span>
		) : null;

	async function toggle(): Promise<void> {
		if (target === null) {
			setMediaVerified.mutate({ episodeIds: null, isVerified: !isVerified });
			return;
		}
		const plan = planVerifiedChange(
			await loadShowSeasons(userMediaId),
			target,
			isVerified,
		);
		if (plan === null) return;
		if (plan.kind === "direct")
			setMediaVerified.mutate({
				episodeIds: plan.episodeIds,
				isVerified: plan.isVerified,
			});
		else
			table.openModal({
				kind: "confirmVerified",
				userMediaId,
				title,
				subject,
				plan,
			});
	}

	if (!table.isEditMode)
		return isVerified ? (
			<span
				className={`${styles.booleanMark} ${nasStyles.verifiedMark}`}
				role="img"
				aria-label="Vérifié"
			>
				<ShieldCheck aria-hidden />
			</span>
		) : (
			progressText
		);
	const disabledReason = getDisabledReason(nas);
	return (
		<span className={nasStyles.verifiedCell}>
			<Checkbox
				checked={isVerified}
				ariaLabel={`Vérifié : ${subject}`}
				size="sm"
				disabled={
					isDisabled || disabledReason !== null || setMediaVerified.isPending
				}
				tooltip={disabledReason}
				className={styles.cellCheckbox}
				onChange={() => {
					void toggle();
				}}
			/>
			{progressText}
		</span>
	);
}
