import { Check, Lock, Plus, Search } from "lucide-react";
import { useRef } from "react";

import type { DlcFm } from "../../../../api/model/dlcFm.type";
import type { UserVersionRowFm } from "../../../../api/model/userVersionRowFm.type";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { Popover } from "../../../../components/Popover";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";
import { formatDlcProgress } from "../../../../helper/format/formatDlcProgress";
import type { TableControls } from "../../tableControls.type";
import { DlcDoneCheckbox } from "../DlcDoneCheckbox";
import { DlcProgress } from "../DlcProgress";

type Props = {
	gameId: number;
	gameName: string;
	userVersion: UserVersionRowFm;
	dlcs: DlcFm[];
	table: TableControls;
};

/**
 * « faits / total » ; un clic ouvre la liste des DLC du jeu, à cocher en mode édition (cahier des charges, §9). En mode
 * édition, elle mène aussi à « Rechercher d'autres DLC », même pour un jeu sans DLC (bouton « + »)
 */
export function DlcCell({ gameId, gameName, userVersion, dlcs, table }: Props) {
	const triggerRef = useRef<HTMLButtonElement>(null);
	const { isEditMode, popover, setPopover } = table;
	const { userVersionId, doneDlcCount, dlcCount } = userVersion;
	const isOpen =
		popover?.kind === "dlc" && popover.userVersionId === userVersionId;

	return (
		<span
			className={styles.popoverAnchor}
			data-popover
		>
			<button
				ref={triggerRef}
				type="button"
				className={joinClassNames(
					styles.dlcButton,
					dlcCount === 0 && styles.addDlcButton,
				)}
				aria-label={
					dlcCount === 0
						? "DLC : en rechercher"
						: `DLC faits : ${formatDlcProgress(doneDlcCount, dlcCount)}`
				}
				aria-haspopup="dialog"
				aria-expanded={isOpen}
				onClick={() =>
					setPopover(isOpen ? null : { kind: "dlc", userVersionId })
				}
			>
				{dlcCount === 0 ? (
					<Plus aria-hidden />
				) : (
					<DlcProgress
						doneCount={doneDlcCount}
						totalCount={dlcCount}
					/>
				)}
			</button>
			{isOpen && (
				<Popover
					anchorRef={triggerRef}
					role="dialog"
					ariaLabel="DLC faits"
					focusOnOpen={isEditMode ? "first" : "panel"}
					returnsFocus
					className={styles.dlcPopover}
				>
					<div className={styles.popoverHeader}>
						<span className={styles.popoverTitle}>DLC faits</span>
						{dlcCount > 0 && (
							<span className={styles.sectionCount}>
								{formatDlcProgress(doneDlcCount, dlcCount)}
							</span>
						)}
						{!isEditMode && (
							<span className={styles.readOnlyTag}>
								<Lock aria-hidden />
								Lecture seule
							</span>
						)}
					</div>
					{dlcs.length > 0 && (
						<ul className={styles.dlcList}>
							{dlcs.map((dlc) => {
								const isDone = userVersion.doneDlcIds.includes(dlc.id);
								return (
									<li key={dlc.id}>
										{isEditMode ? (
											<DlcDoneCheckbox
												gameId={gameId}
												userVersionId={userVersionId}
												dlc={dlc}
												isDone={isDone}
											/>
										) : (
											// En lecture seule, la liste se consulte : une coche pour un DLC fait
											<span
												className={joinClassNames(
													styles.readOnlyDlc,
													isDone && styles.doneDlc,
												)}
											>
												<span className={styles.doneMark}>
													{isDone && <Check aria-label="Fait" />}
												</span>
												{dlc.name}
											</span>
										)}
									</li>
								);
							})}
						</ul>
					)}
					{isEditMode && (
						<div className={styles.popoverFooter}>
							<Button
								icon={Search}
								variant="ghost"
								size="sm"
								onClick={() => {
									setPopover(null);
									table.openModal({ kind: "addDlcs", gameId, gameName });
								}}
							>
								Rechercher d’autres DLC
							</Button>
						</div>
					)}
				</Popover>
			)}
		</span>
	);
}
