import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
	type NonAttribute,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import { User } from "./User.ts";

// Code de secours, à usage unique : seulement son SHA-256. usedAt null : encore utilisable
export class RecoveryCode extends Model<
	InferAttributes<RecoveryCode>,
	InferCreationAttributes<RecoveryCode>
> {
	declare id: CreationOptional<number>;
	declare userId: number;
	declare codeHash: Buffer;
	declare usedAt: CreationOptional<Date | null>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare user?: NonAttribute<User>;
}

RecoveryCode.init(
	{
		id: {
			type: DataTypes.INTEGER,
			field: "id",
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		userId: {
			type: DataTypes.INTEGER,
			field: "user_id",
			allowNull: false,
		},
		codeHash: {
			type: DataTypes.BLOB,
			field: "code_hash",
			allowNull: false,
		},
		usedAt: {
			type: DataTypes.DATE(3),
			field: "used_at",
			allowNull: true,
		},
		createdAt: {
			type: DataTypes.DATE(3),
			field: "created_at",
			allowNull: false,
		},
		updatedAt: {
			type: DataTypes.DATE(3),
			field: "updated_at",
			allowNull: false,
		},
	},
	{
		sequelize,
		tableName: "auth_recovery_code",
		modelName: "AuthRecoveryCode",
		timestamps: true,
	},
);

RecoveryCode.belongsTo(User, { foreignKey: "userId", as: "user" });
