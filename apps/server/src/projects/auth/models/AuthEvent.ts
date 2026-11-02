import { truncateCodePoints } from "@citadel/common/src/universal/string/truncateCodePoints.ts";
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
import { USER_AGENT_MAX_LENGTH } from "./userAgentMaxLength.ts";

// Événement du journal de sécurité, purgé à 20 jours. userId null : aucun compte trouvé.
// Pas « Event » : le nom masquerait l'Event global de Node
export class AuthEvent extends Model<
	InferAttributes<AuthEvent>,
	InferCreationAttributes<AuthEvent>
> {
	declare id: CreationOptional<number>;
	declare userId: number | null;
	declare type: string;
	// Tronquée comme celle d'une session
	declare ip: string;
	// Tronqué à la taille de la colonne
	declare userAgent: string | null;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare user?: NonAttribute<User>;
}

AuthEvent.init(
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
			type: DataTypes.STRING(USER_AGENT_MAX_LENGTH),
			field: "user_agent",
			allowNull: true,
			set(this: AuthEvent, userAgent: string | null) {
				this.setDataValue(
					"userAgent",
					userAgent === null
						? null
						: truncateCodePoints(userAgent, USER_AGENT_MAX_LENGTH),
				);
			},
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

AuthEvent.belongsTo(User, { foreignKey: "userId", as: "user" });
