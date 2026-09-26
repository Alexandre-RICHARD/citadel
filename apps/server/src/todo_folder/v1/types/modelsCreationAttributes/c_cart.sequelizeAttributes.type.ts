import type { CartModelAttributes } from "../models/c_cart.type.ts";

export type CartCreationAttributes = Omit<CartModelAttributes, "u_id_user">;
