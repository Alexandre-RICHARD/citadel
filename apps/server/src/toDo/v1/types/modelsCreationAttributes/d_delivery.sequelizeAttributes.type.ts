import type { DeliveryModelAttributes } from "../models/d_delivery.type.ts";

export type DeliveryCreationAttributes = Omit<
  DeliveryModelAttributes,
  "u_id_user"
>;
