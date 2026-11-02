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

// Session ouverte : seulement le SHA-256 du jeton du cookie ; expiresAt glisse sans dépasser absoluteExpiresAt
export class Session extends Model<
	InferAttributes<Session>,
	InferCreationAttributes<Session>
> {
	declare id: CreationOptional<number>;
	declare userId: number;
	declare tokenHash: Buffer;
	declare remember: boolean;
	// Tronqué à la taille de la colonne
	declare userAgent: string | null;
	// Tronquée : /24 en IPv4, /48 en IPv6
	declare ip: string;
	declare lastSeenAt: Date;
	declare expiresAt: Date;
	declare absoluteExpiresAt: Date;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare user?: NonAttribute<User>;
}

Session.init(
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
		tokenHash: {
			type: DataTypes.BLOB,
			field: "token_hash",
			allowNull: false,
		},
		remember: {
			type: DataTypes.BOOLEAN,
			field: "remember",
			allowNull: false,
		},
		userAgent: {
			type: DataTypes.STRING(USER_AGENT_MAX_LENGTH),
			field: "user_agent",
			allowNull: true,
			set(this: Session, userAgent: string | null) {
				this.setDataValue(
					"userAgent",
					userAgent === null
						? null
						: truncateCodePoints(userAgent, USER_AGENT_MAX_LENGTH),
				);
			},
		},
		ip: {
			type: DataTypes.STRING(45),
			field: "ip",
			allowNull: false,
		},
		lastSeenAt: {
			type: DataTypes.DATE(3),
			field: "last_seen_at",
			allowNull: false,
		},
		expiresAt: {
			type: DataTypes.DATE(3),
			field: "expires_at",
			allowNull: false,
		},
		absoluteExpiresAt: {
			type: DataTypes.DATE(3),
			field: "absolute_expires_at",
			allowNull: false,
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
		tableName: "auth_session",
		modelName: "AuthSession",
		timestamps: true,
	},
);

Session.belongsTo(User, { foreignKey: "userId", as: "user" });
