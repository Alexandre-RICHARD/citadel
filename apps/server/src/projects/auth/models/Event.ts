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

// Événement du journal de sécurité, purgé à 20 jours. userId null : aucun compte trouvé
export class Event extends Model<
	InferAttributes<Event>,
	InferCreationAttributes<Event>
> {
	declare id: CreationOptional<number>;
	declare userId: number | null;
	declare type: string;
	// Tronquée comme celle d'une session
	declare ip: string;
	declare userAgent: string | null;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare user?: NonAttribute<User>;
}

Event.init(
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
			allowNull: true,
		},
		type: {
			type: DataTypes.STRING(50),
			field: "type",
			allowNull: false,
		},
		ip: {
			type: DataTypes.STRING(45),
			field: "ip",
			allowNull: false,
		},
		userAgent: {
			type: DataTypes.STRING(255),
			field: "user_agent",
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
		tableName: "auth_event",
		modelName: "AuthEvent",
		timestamps: true,
	},
);

Event.belongsTo(User, { foreignKey: "userId", as: "user" });
