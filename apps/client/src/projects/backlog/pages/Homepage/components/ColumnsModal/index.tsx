import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { ChevronDown, ChevronUp, Columns3 } from "lucide-react";

import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { Checkbox } from "../../../../components/Checkbox";
import { Modal } from "../../../../components/Modal";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";
import { columnLabels } from "../../../../helper/label/columnLabels";
import type { ColumnSetting } from "../../../../helper/view/columnSetting.type";

type Props = {
	columns: ColumnSetting[];
	onToggleVisibility: (key: BacklogColumnEnum) => void;
	onMove: (key: BacklogColumnEnum, offset: -1 | 1) => void;
	onClose: () => void;
};

// Visibilité et ordre des colonnes : appliqués tout de suite, gardés dans le navigateur
export function ColumnsModal({
	columns,
	onToggleVisibility,
	onMove,
	onClose,
}: Props) {
	const visibleCount = columns.filter(({ isVisible }) => isVisible).length;

	// Déplacée en premier ou en dernier, une colonne perd un de ses boutons : le focus passe à l'autre
	function move(
		key: BacklogColumnEnum,
		offset: -1 | 1,
		button: HTMLButtonElement,
		isReachingEnd: boolean,
	) {
		onMove(key, offset);
		if (!isReachingEnd) return;
		const row = button.closest("li");
		window.requestAnimationFrame(() =>
			row
				?.querySelector<HTMLButtonElement>(
					`[data-move="${offset === -1 ? "down" : "up"}"]`,
				)
				?.focus(),
		);
	}

	return (
		<Modal
			title="Colonnes"
			subtitle={`${visibleCount} sur ${columns.length} affichées`}
			icon={Columns3}
			size="sm"
			actions={
				<Button
					variant="primary"
					onClick={onClose}
				>
					Fermer
				</Button>
			}
			onClose={onClose}
		>
			<p className={styles.modalIntro}>
				Masquer une colonne la retire aussi du tri et des filtres. L’ordre et la
				visibilité sont gardés dans ce navigateur.
			</p>
			<ol className={styles.columnList}>
				{columns.map(({ key, isVisible }, index) => {
					const label = columnLabels[key];
					const isActions = key === BacklogColumnEnum.ACTIONS;
					return (
						<li
							key={key}
							className={joinClassNames(
								styles.columnItem,
								!isVisible && styles.hiddenColumn,
							)}
						>
							<Checkbox
								variant="switch"
								checked={isVisible}
								disabled={isActions}
								label={label}
								tooltip={
									isActions
										? "Toujours visible : sans elle, plus de menu"
										: null
								}
								onChange={() => onToggleVisibility(key)}
							/>
							<span className={styles.columnMoves}>
								<button
									type="button"
									className={styles.moveButton}
									data-move="up"
									aria-label={`Monter ${label}`}
									disabled={index === 0}
									onClick={(event) =>
										move(key, -1, event.currentTarget, index === 1)
									}
								>
									<ChevronUp aria-hidden />
								</button>
								<button
									type="button"
									className={styles.moveButton}
									data-move="down"
									aria-label={`Descendre ${label}`}
									disabled={index === columns.length - 1}
									onClick={(event) =>
										move(
											key,
											1,
											event.currentTarget,
											index === columns.length - 2,
										)
									}
								>
									<ChevronDown aria-hidden />
								</button>
							</span>
						</li>
					);
				})}
			</ol>
		</Modal>
	);
}
