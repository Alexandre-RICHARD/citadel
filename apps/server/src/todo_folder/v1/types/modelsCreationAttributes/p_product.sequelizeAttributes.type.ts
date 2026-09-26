import type { ProductModelAttributes } from "../models/p_product.type";

export type ProductCreationAttributes = Omit<
  ProductModelAttributes,
  "p_product"
>;
