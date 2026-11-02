import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

export class ContactMessageUnsent extends Model<
	InferAttributes<ContactMessageUnsent>,
	InferCreationAttributes<ContactMessageUnsent>
> {
	declare id: CreationOptional<number>;
	declare subject: string;
	declare message: string;
	declare name: string | null;
	declare email: string | null;
	declare createdAt: CreationOptional<Date>;
}

ContactMessageUnsent.init(
	{
		id: {
			type: DataTypes.INTEGER,
			field: "id",
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		subject: {
			type: DataTypes.STRING(150),
			field: "subject",
			allowNull: false,
		},
		message: {
			type: DataTypes.TEXT,
			field: "message",
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING(100),
			field: "name",
			allowNull: true,
		},
		email: {
			type: DataTypes.STRING(254),
			field: "email",
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
		tableName: "contact_message_unsent",
		modelName: "ContactMessageUnsent",
		timestamps: true,
		updatedAt: false,
	},
);
