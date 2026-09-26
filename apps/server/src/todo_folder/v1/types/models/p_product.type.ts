export type ProductModelAttributes = {
  p_id_product: number;
  p_name: string;
  p_description: string;
  p_price: number;
  p_registered_at: Date;
  p_is_available: boolean;
  p_stock: number;
  p_disable_at: Date | null;
  p_id_product_type: number;
  p_id_user: number;
};
