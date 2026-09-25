export type UserModelAttributes = {
  u_id_user: number;
  u_role: string;
  u_registered_at: Date;
  u_lastname: string;
  u_firstname: string;
  u_mail_adress: string;
  u_hashed_password: string;
  u_adress_country: string;
  u_adress_region_code: string;
  u_adress_city: string;
  u_adress_location: string;
  u_adress_precision?: string | null;
  u_is_deleted: boolean;
};
