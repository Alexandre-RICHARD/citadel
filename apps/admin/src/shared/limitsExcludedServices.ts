// Les conteneurs dont la console ne change jamais les limites : c'est par eux (la
// console, infra-ops, le filtre Docker) qu'on annule. La même liste dans infra/citadel
// (LIMITS_EXCLUDED), qui la revérifie.
export const LIMITS_EXCLUDED_SERVICES = [
	"infra-admin",
	"infra-ops",
	"infra-socket-proxy",
];
