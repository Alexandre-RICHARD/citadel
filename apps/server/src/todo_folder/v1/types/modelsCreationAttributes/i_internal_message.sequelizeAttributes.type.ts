import type { InternalMessagesModelAttributes } from "../models/i_internal_message.type.ts";

export type InternalMessagesCreationAttributes = Omit<
  InternalMessagesModelAttributes,
  "u_id_user"
>;
