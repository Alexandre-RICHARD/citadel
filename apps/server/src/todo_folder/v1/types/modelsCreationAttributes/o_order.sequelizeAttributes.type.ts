import type { OrdersModelAttributes } from "../models/o_order.type";

export type OrdersCreationAttributes = Omit<
  OrdersModelAttributes,
  "o_id_user_order"
>;
