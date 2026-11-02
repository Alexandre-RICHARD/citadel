import type { FactorTypeEnum } from "@citadel/specs/src/projects/auth/enum/factorType.enum.ts";
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

// Second facteur d'un compte. Secret, version de clé et dernier pas : TOTP seulement
export class Factor extends Model<
	InferAttributes<Factor>,
	InferCreationAttributes<Factor>
> {
	declare id: CreationOptional<number>;
	declare userId: number;
	declare type: FactorTypeEnum;
	declare name: string;
	// AES-256-GCM, avec la version de la clé et l'id du facteur en donnée associée : écrit après l'insertion
	declare secretEncrypted: CreationOptional<Buffer | null>;
	declare keyVersion: CreationOptional<number | null>;
	// Pas de 30 s du dernier code accepté : un code ne resert jamais
	declare lastUsedStep: CreationOptional<number | null>;
	declare lastUsedAt: CreationOptional<Date | null>;
	// Null tant que le premier code n'a pas été validé : le facteur n'est pas actif
	declare confirmedAt: CreationOptional<Date | null>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare user?: NonAttribute<User>;
}

Factor.init(
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
		type: {
			type: DataTypes.STRING,
			field: "type",
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING(50),
			field: "name",
			allowNull: false,
		},
		secretEncrypted: {
			type: DataTypes.BLOB,
			field: "secret_encrypted",
			allowNull: true,
		},
		keyVersion: {
			type: DataTypes.TINYINT.UNSIGNED,
			field: "key_version",
			allowNull: true,
		},
		lastUsedStep: {
			type: DataTypes.INTEGER,
			field: "last_used_step",
			allowNull: true,
		},
		lastUsedAt: {
			type: DataTypes.DATE(3),
			field: "last_used_at",
			allowNull: true,
		},
		confirmedAt: {
			type: DataTypes.DATE(3),
			field: "confirmed_at",
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
		tableName: "auth_factor",
		modelName: "AuthFactor",
		timestamps: true,
	},
);

Factor.belongsTo(User, { foreignKey: "userId", as: "user" });
