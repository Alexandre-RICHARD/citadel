import { LoginMethodEnum } from "@citadel/specs/src/projects/auth/enum/loginMethod.enum.ts";
import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

// Compte d'un utilisateur. Email sans distinction de casse, pseudo sensible à chaque caractère (collations en base)
export class User extends Model<
	InferAttributes<User>,
	InferCreationAttributes<User>
> {
	declare id: CreationOptional<number>;
	declare email: string;
	declare username: string;
	// null : le pseudo affiché est le username
	declare displayName: CreationOptional<string | null>;
	declare passwordHash: string;
	declare passwordChangedAt: Date;
	declare loginMethods: CreationOptional<LoginMethodEnum>;
	declare lastLoginAt: CreationOptional<Date | null>;
	declare lastSeenAt: CreationOptional<Date | null>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

User.init(
	{
		id: {
			type: DataTypes.INTEGER,
			field: "id",
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING(254),
			field: "email",
			allowNull: false,
		},
		username: {
			type: DataTypes.STRING(64),
			field: "username",
			allowNull: false,
		},
		displayName: {
			type: DataTypes.STRING(64),
			field: "display_name",
			allowNull: true,
		},
		passwordHash: {
			type: DataTypes.STRING(255),
			field: "password_hash",
			allowNull: false,
		},
		passwordChangedAt: {
			type: DataTypes.DATE(3),
			field: "password_changed_at",
			allowNull: false,
		},
		loginMethods: {
			type: DataTypes.STRING,
			field: "login_methods",
			allowNull: false,
			defaultValue: LoginMethodEnum.BOTH,
		},
		lastLoginAt: {
			type: DataTypes.DATE(3),
			field: "last_login_at",
			allowNull: true,
		},
		lastSeenAt: {
			type: DataTypes.DATE(3),
			field: "last_seen_at",
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
		tableName: "auth_user",
		modelName: "AuthUser",
		timestamps: true,
	},
);
