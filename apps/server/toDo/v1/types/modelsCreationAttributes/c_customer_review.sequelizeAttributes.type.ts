import type { CustomerReviewModelAttributes } from "../models/c_customer_review.type";

export type CustomerReviewCreationAttributes = Omit<
  CustomerReviewModelAttributes,
  "u_id_user"
>;
