import type { CommercialHandlingModelAttributes } from "../models/c_commercial_handling.type.ts";

export type CommercialHandlingCreationAttributes = Omit<
  CommercialHandlingModelAttributes,
  "u_id_user"
>;
