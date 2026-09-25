import type { ImagesModelAttributes } from "../models/i_image.type.ts";

export type ImagesCreationAttributes = Omit<ImagesModelAttributes, "u_id_user">;
