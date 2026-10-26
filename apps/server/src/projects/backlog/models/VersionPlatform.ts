import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
	type NonAttribute,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import { Platform } from "./Platform.ts";
import { Version } from "./Version.ts";

// La version est sortie sur cette plateforme, à cette date (la plus ancienne, toutes régions confondues)
export class VersionPlatform extends Model<
	InferAttributes<VersionPlatform>,
	InferCreationAttributes<VersionPlatform>
> {
	declare versionId: number;
	declare platformId: number;
	declare releaseDate: string | null;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare platform?: NonAttribute<Platform>;
}

VersionPlatform.init(
	{
		versionId: {
			type: DataTypes.INTEGER,
			field: "version_id",
			primaryKey: true,
			allowNull: false,
		},
		platformId: {
			type: DataTypes.INTEGER,
			field: "platform_id",
			primaryKey: true,
			allowNull: false,
		},
		releaseDate: {
			type: DataTypes.DATEONLY,
			field: "release_date",
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
		tableName: "backlog_version_platform",
		modelName: "BacklogVersionPlatform",
		timestamps: true,
	},
);

Version.hasMany(VersionPlatform, {
	foreignKey: "versionId",
	as: "versionPlatforms",
});
VersionPlatform.belongsTo(Platform, {
	foreignKey: "platformId",
	as: "platform",
});
