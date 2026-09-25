import type { ImagesModelAttributes } from "../models/i_image.type";

export type ImagesCreationAttributes = Omit<ImagesModelAttributes, "u_id_user">;
