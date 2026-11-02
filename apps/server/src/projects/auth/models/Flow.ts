import type { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import type { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";
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

// Parcours en plusieurs étapes, lié au navigateur par le SHA-256 du jeton de son cookie. userId null : une inscription,
// dont le compte attend dans payload
export class Flow extends Model<
	InferAttributes<Flow>,
	InferCreationAttributes<Flow>
> {
	declare id: CreationOptional<number>;
	declare tokenHash: Buffer;
	declare kind: FlowKindEnum;
	declare step: FlowStepEnum;
	declare userId: number | null;
	// L'adresse du mail
	declare email: string;
	// Inscription : username et passwordHash ; changement d'email : la nouvelle adresse
	declare payload: CreationOptional<Record<string, string> | null>;
	declare codeHmac: CreationOptional<Buffer | null>;
	declare linkTokenHash: CreationOptional<Buffer | null>;
	declare attempts: CreationOptional<number>;
	declare sendCount: CreationOptional<number>;
	// Appliqué à la session ouverte en fin de parcours
	declare remember: CreationOptional<boolean>;
	declare lastSentAt: CreationOptional<Date | null>;
	declare expiresAt: Date;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare user?: NonAttribute<User>;
}

Flow.init(
	{
		id: {
			type: DataTypes.INTEGER,
			field: "id",
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		tokenHash: {
			type: DataTypes.BLOB,
			field: "token_hash",
			allowNull: false,
		},
		kind: {
			type: DataTypes.STRING,
			field: "kind",
			allowNull: false,
		},
		step: {
			type: DataTypes.STRING,
			field: "step",
			allowNull: false,
		},
		userId: {
			type: DataTypes.INTEGER,
			field: "user_id",
			allowNull: true,
		},
		email: {
			type: DataTypes.STRING(254),
			field: "email",
			allowNull: false,
		},
		payload: {
			type: DataTypes.JSON,
			field: "payload",
			allowNull: true,
		},
		codeHmac: {
			type: DataTypes.BLOB,
			field: "code_hmac",
			allowNull: true,
		},
		linkTokenHash: {
			type: DataTypes.BLOB,
			field: "link_token_hash",
			allowNull: true,
		},
		attempts: {
			type: DataTypes.INTEGER,
			field: "attempts",
			allowNull: false,
			defaultValue: 0,
		},
		sendCount: {
			type: DataTypes.INTEGER,
			field: "send_count",
			allowNull: false,
			defaultValue: 0,
		},
		remember: {
			type: DataTypes.BOOLEAN,
			field: "remember",
			allowNull: false,
			defaultValue: false,
		},
		lastSentAt: {
			type: DataTypes.DATE(3),
			field: "last_sent_at",
			allowNull: true,
		},
		expiresAt: {
			type: DataTypes.DATE(3),
			field: "expires_at",
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
		tableName: "auth_flow",
		modelName: "AuthFlow",
		timestamps: true,
	},
);

Flow.belongsTo(User, { foreignKey: "userId", as: "user" });
