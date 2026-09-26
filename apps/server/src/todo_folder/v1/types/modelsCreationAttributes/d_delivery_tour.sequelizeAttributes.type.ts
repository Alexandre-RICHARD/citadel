import type { DeliveryTourModelAttributes } from "../models/d_delivery_tour.type.ts";

export type DeliveryTourCreationAttributes = Omit<
  DeliveryTourModelAttributes,
  "u_id_user"
>;
