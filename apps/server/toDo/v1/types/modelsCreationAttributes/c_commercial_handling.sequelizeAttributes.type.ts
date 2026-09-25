import type { CommercialHandlingModelAttributes } from "../models/c_commercial_handling.type";

export type CommercialHandlingCreationAttributes = Omit<
  CommercialHandlingModelAttributes,
  "u_id_user"
>;
