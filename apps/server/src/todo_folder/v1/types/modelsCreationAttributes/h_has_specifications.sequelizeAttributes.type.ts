import type { HasSpecificationsModelAttributes } from "../models/h_has_specifications.type";

export type HasSpecificationsCreationAttributes = Omit<
  HasSpecificationsModelAttributes,
  "u_id_user"
>;
