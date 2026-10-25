// Une source que la console n'a pas pu lire (service arrêté, identifiant refusé…)
export type Unavailable = {
	available: false;
	reason: string;
};
