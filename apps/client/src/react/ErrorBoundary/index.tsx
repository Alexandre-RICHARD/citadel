import { Component, type ReactNode } from "react";

type Props = {
	children: ReactNode;
	renderFallback: (error: unknown, reset: () => void) => ReactNode;
	// Avant de réafficher les enfants, ex. autoriser TanStack Query à relancer les requêtes en erreur
	onReset?: () => void;
};

// L'erreur est emballée : un composant peut lever undefined
type State = { caught: { error: unknown } | null };

// React n'attrape une erreur de rendu que dans une classe. Il la logge lui-même en console : ne pas y toucher
export class ErrorBoundary extends Component<Props, State> {
	state: State = { caught: null };

	static getDerivedStateFromError(error: unknown): State {
		return { caught: { error } };
	}

	reset = (): void => {
		this.props.onReset?.();
		this.setState({ caught: null });
	};

	render(): ReactNode {
		const { caught } = this.state;
		if (caught === null) return this.props.children;
		return this.props.renderFallback(caught.error, this.reset);
	}
}
