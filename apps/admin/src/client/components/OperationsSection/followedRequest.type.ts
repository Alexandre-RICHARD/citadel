// Une demande suivie dans la fenêtre, et ce qu'on propose une fois qu'elle a réussi
// (« Déployer » après le plan)
export type FollowedRequest = {
	id: string;
	title: string;
	next?:
		| {
				label: string;
				variant: "primary" | "danger";
				run: () => void;
		  }
		| undefined;
};
