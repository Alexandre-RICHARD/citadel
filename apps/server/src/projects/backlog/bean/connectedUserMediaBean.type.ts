import type { NasDetailsBean } from "../nas/merge/nasDetailsBean.type.ts";
import type { UserMediaBean } from "./userMediaBean.type.ts";

// Une ligne du tableau en mode connecté : celle du mode classique, et ses colonnes du NAS
export type ConnectedUserMediaBean = UserMediaBean & { nas: NasDetailsBean };
