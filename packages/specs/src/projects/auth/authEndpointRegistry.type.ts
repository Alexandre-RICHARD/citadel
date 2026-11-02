import type { GetMe } from "./endpoint/me/getMe/getMeEndpoint.interface.ts";
import type { Logout } from "./endpoint/sessions/logout/logoutEndpoint.interface.ts";

export type AuthEndpointRegistry = GetMe | Logout;
