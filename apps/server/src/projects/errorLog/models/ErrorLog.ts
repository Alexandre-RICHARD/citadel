import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
} from "sequelize";

import { sequelize } from "../../../sequelize.ts";

export class ErrorLog extends Model<
	InferAttributes<ErrorLog>,
	InferCreationAttributes<ErrorLog>
> {
	declare id: CreationOptional<number>;
	declare errorType: string;
	declare message: string;
	declare stack: string | null;
	declare createdAt: CreationOptional<Date>;
}

ErrorLog.init(
	{
		id: {
			type: DataTypes.INTEGER,
			field: "id",
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		errorType: {
			type: DataTypes.STRING(100),
			field: "error_type",
			allowNull: false,
		},
		message: {
			type: DataTypes.TEXT,
			field: "message",
			allowNull: false,
		},
		stack: {
			type: DataTypes.TEXT("long"),
			field: "stack",
			allowNull: true,
		},
		createdAt: {
			type: DataTypes.DATE(3),
			field: "created_at",
			allowNull: false,
		},
	},
	{
		sequelize,
		tableName: "error_log",
		modelName: "ErrorLog",
		timestamps: true,
		updatedAt: false,
	},
);
