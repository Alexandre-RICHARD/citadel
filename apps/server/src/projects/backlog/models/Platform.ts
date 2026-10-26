import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

// Plateforme IGDB, ou émulateur (id négatif) rattaché à la console qu'il émule
export class Platform extends Model<
	InferAttributes<Platform>,
	InferCreationAttributes<Platform>
> {
	declare id: number;
	declare shortName: string;
	declare technicalName: string;
	declare emulatedPlatformId: number | null;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

Platform.init(
	{
		id: {
			type: DataTypes.INTEGER,
			field: "id",
			primaryKey: true,
			allowNull: false,
		},
		shortName: {
			type: DataTypes.STRING(100),
			field: "short_name",
			allowNull: false,
		},
		technicalName: {
			type: DataTypes.STRING(100),
			field: "technical_name",
			allowNull: false,
		},
		emulatedPlatformId: {
			type: DataTypes.INTEGER,
			field: "emulated_platform_id",
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
		tableName: "backlog_platform",
		modelName: "BacklogPlatform",
		timestamps: true,
	},
);
