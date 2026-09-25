import type { CartModelAttributes } from "../models/c_cart.type";

export type CartCreationAttributes = Omit<CartModelAttributes, "u_id_user">;
