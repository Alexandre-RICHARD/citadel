import type { ProductModelAttributes } from "../models/p_product.type.ts";

export type ProductCreationAttributes = Omit<
  ProductModelAttributes,
  "p_product"
>;
