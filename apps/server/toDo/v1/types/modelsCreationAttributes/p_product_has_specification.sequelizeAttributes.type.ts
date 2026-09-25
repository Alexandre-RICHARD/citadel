import type { ProductHasSpecificationModelAttributes } from "../models/p_product_has_specification.type";

export type ProductHasSpecificationCreationAttributes = Omit<
  ProductHasSpecificationModelAttributes,
  "p_id_product_has_specification"
>;
