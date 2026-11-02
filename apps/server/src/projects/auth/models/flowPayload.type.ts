import type { EmailChangePayload } from "./emailChangePayload.type.ts";
import type { IdentifierPayload } from "./identifierPayload.type.ts";
import type { RegistrationPayload } from "./registrationPayload.type.ts";

// Colonne JSON auth_flow.payload : vide pour les autres parcours
export type FlowPayload =
	RegistrationPayload | EmailChangePayload | IdentifierPayload;
