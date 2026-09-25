export type OrdersModelAttributes = {
  o_id_user_order: number;
  o_order_number: string;
  o_status: string;
  o_ordered_at: Date;
  o_discount: number;
  o_final_price: number;
  o_delivery_adress_country: string;
  o_delivery_adress_region_code: string;
  o_delivery_adress_city: string;
  o_delivery_adress_location: string;
  o_delivery_adress_precision: string | null;
};
