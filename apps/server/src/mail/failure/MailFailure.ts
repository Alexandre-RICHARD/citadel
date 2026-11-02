import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
} from "sequelize";

import { sequelize } from "../../configuration/sequelize.ts";

export class MailFailure extends Model<
	InferAttributes<MailFailure>,
	InferCreationAttributes<MailFailure>
> {
	declare id: CreationOptional<number>;
	declare kind: string;
	declare reason: string;
	declare createdAt: CreationOptional<Date>;
}

MailFailure.init(
	{
		id: {
			type: DataTypes.INTEGER,
			field: "id",
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		kind: {
			type: DataTypes.STRING(50),
			field: "kind",
			allowNull: false,
		},
		reason: {
			type: DataTypes.STRING(500),
			field: "reason",
			allowNull: false,
		},
		createdAt: {
			type: DataTypes.DATE(3),
			field: "created_at",
			allowNull: false,
		},
	},
	{
		sequelize,
		tableName: "mail_failure",
		modelName: "MailFailure",
		timestamps: true,
		updatedAt: false,
	},
);
