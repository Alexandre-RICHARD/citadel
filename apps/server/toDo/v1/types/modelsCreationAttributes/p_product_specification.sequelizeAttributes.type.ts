import type { ProductSpecificationsModelAttributes } from "../models/p_product_specification.type";

export type ProductSpecificationsCreationAttributes = Omit<
  ProductSpecificationsModelAttributes,
  "p_id_product_specification"
>;
