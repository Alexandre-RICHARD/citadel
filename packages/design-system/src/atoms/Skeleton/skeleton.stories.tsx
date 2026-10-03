import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, Flame, Pencil, Trash2 } from "lucide-react";
import { fn } from "storybook/test";

import { CountBadge } from "../CountBadge";
import { ExpandToggle } from "../ExpandToggle";
import { IconButton } from "../IconButton";
import { Pill } from "../Pill";
import { Skeleton } from ".";

const sampleRow = (
	<div
		style={{
			display: "flex",
			alignItems: "center",
			gap: "10px",
			padding: "12px 14px",
			border: "1px solid var(--theme-colorBorderSoft)",
			borderRadius: "var(--theme-radiusL)",
		}}
	>
		<ExpandToggle
			expanded={false}
			onToggle={fn()}
			expandLabel="Déplier"
			collapseLabel="Replier"
		/>
		<div style={{ flex: 1 }}>
			<h3 style={{ margin: 0 }}>Elden Ring</h3>
			<p style={{ margin: 0, fontSize: "12px" }}>Commencé le 14/02/2025</p>
		</div>
		<Pill>
			<Check size={12} />
			terminé
		</Pill>
		<CountBadge
			count={42}
			icon={Flame}
		/>
		<IconButton
			icon={Pencil}
			label="Modifier"
			onClick={fn()}
		/>
		<IconButton
			icon={Trash2}
			label="Supprimer"
			variant="destructive"
			onClick={fn()}
		/>
	</div>
);

const meta = {
	title: "Atoms/Skeleton",
	component: Skeleton,
	args: {
		label: "Chargement des jeux",
		children: sampleRow,
	},
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Le même rendu, avec et sans Skeleton
export const Comparison: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
			{sampleRow}
			<Skeleton label="Chargement des jeux">{sampleRow}</Skeleton>
		</div>
	),
};
