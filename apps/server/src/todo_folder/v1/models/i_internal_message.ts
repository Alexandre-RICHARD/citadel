import { DataTypes, type ModelDefined } from "sequelize";

import { database as db } from "../../database.ts";
import type { InternalMessagesModelAttributes } from "../types/models/i_internal_message.type.ts";
import type { InternalMessagesCreationAttributes } from "../types/modelsCreationAttributes/i_internal_message.sequelizeAttributes.type.ts";
import { UsersModel } from "./u_user.ts";

export const InternalMessagesModel: ModelDefined<
  InternalMessagesModelAttributes,
  InternalMessagesCreationAttributes
> = db.define(
  "InternalMessages",
  {
    i_id_internal_message: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    i_send_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    i_read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    i_message_content: {
      type: DataTypes.STRING(5000),
      allowNull: false,
    },
    i_id_user_receiver: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    i_id_user_sender: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "i_internal_message",
    timestamps: false,
  },
);

// Foreign key
InternalMessagesModel.belongsTo(UsersModel, {
  foreignKey: "i_id_user_receiver",
  as: "receiver",
});

InternalMessagesModel.belongsTo(UsersModel, {
  foreignKey: "i_id_user_sender",
  as: "sender",
});
