import type { ComponentType } from "react";

// Compatible avec les icônes de lucide-react
export type IconComponent = ComponentType<{
	size?: number;
	strokeWidth?: number;
	className?: string;
}>;
