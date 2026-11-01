import type { FollowedRequest } from "./followedRequest.type";

// Dépose une demande et la suit dans la fenêtre (job, plan, déploiement, restauration)
export type SendRequest = (
	path: string,
	body: unknown,
	title: string,
	next?: FollowedRequest["next"],
) => void;
