import { SubPlatformTypeEnum } from "@citadel/specs/src/projects/backlog/enum/subPlatformType.enum.ts";
import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

// Plateforme IGDB, ou sous-plateforme (id négatif : émulateur, launcher) rattachée à sa plateforme parente
export class Platform extends Model<
	InferAttributes<Platform>,
	InferCreationAttributes<Platform>
> {
	declare id: number;
	declare shortName: string;
	declare technicalName: string;
	declare parentPlatformId: number | null;
	declare subPlatformType: SubPlatformTypeEnum | null;
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
		parentPlatformId: {
			type: DataTypes.INTEGER,
			field: "parent_platform_id",
			allowNull: true,
		},
		subPlatformType: {
			type: DataTypes.ENUM(...Object.values(SubPlatformTypeEnum)),
			field: "sub_platform_type",
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
