import type { OrdersModelAttributes } from "../models/o_order.type.ts";

export type OrdersCreationAttributes = Omit<
  OrdersModelAttributes,
  "o_id_user_order"
>;
