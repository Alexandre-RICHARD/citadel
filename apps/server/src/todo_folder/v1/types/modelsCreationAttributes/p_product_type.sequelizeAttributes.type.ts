import type { ProductTypesModelAttributes } from "../models/p_product_type.type.ts";

export type ProductTypesCreationAttributes = Omit<
  ProductTypesModelAttributes,
  "p_id_product_type"
>;
