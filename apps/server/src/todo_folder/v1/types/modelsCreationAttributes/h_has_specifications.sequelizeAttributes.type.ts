import type { HasSpecificationsModelAttributes } from "../models/h_has_specifications.type.ts";

export type HasSpecificationsCreationAttributes = Omit<
  HasSpecificationsModelAttributes,
  "u_id_user"
>;
