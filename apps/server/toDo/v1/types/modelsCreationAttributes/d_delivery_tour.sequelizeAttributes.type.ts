import type { DeliveryTourModelAttributes } from "../models/d_delivery_tour.type";

export type DeliveryTourCreationAttributes = Omit<
  DeliveryTourModelAttributes,
  "u_id_user"
>;
