import { DataTypes, type ModelDefined } from "sequelize";

import { database as db } from "../../database";
import type { OrdersModelAttributes } from "../types/models/o_order.type";
import type { OrdersCreationAttributes } from "../types/modelsCreationAttributes/o_order.sequelizeAttributes.type";

export const OrdersModel: ModelDefined<
  OrdersModelAttributes,
  OrdersCreationAttributes
> = db.define(
  "Orders",
  {
    o_id_user_order: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    o_order_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    o_status: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    o_ordered_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    o_discount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    o_final_price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    o_delivery_adress_country: {
      type: DataTypes.STRING(75),
      allowNull: false,
    },
    o_delivery_adress_region_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    o_delivery_adress_city: {
      type: DataTypes.STRING(75),
      allowNull: false,
    },
    o_delivery_adress_location: {
      type: DataTypes.STRING(75),
      allowNull: false,
    },
    o_delivery_adress_precision: {
      type: DataTypes.STRING(75),
      allowNull: true,
    },
  },
  {
    tableName: "o_order",
    timestamps: false,
  },
);
