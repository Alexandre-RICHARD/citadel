import type { OrderContainsModelAttributes } from "../models/o_order_contains.type.ts";

export type OrderContainsCreationAttributes = Omit<
  OrderContainsModelAttributes,
  "o_id_order_contains"
>;
