import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
	type NonAttribute,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import { Game } from "./Game.ts";
import type { VersionPlatform } from "./VersionPlatform.ts";

// Version : toute fiche IGDB rattachée au jeu ; `title` à null pour la version originale, qui affiche le nom du jeu
export class Version extends Model<
	InferAttributes<Version>,
	InferCreationAttributes<Version>
> {
	declare id: number;
	declare gameId: number;
	declare title: string | null;
	declare coverImageId: string | null;
	declare igdbUrl: string;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare game?: NonAttribute<Game>;
	declare versionPlatforms?: NonAttribute<VersionPlatform[]>;
}

Version.init(
	{
		id: {
			type: DataTypes.INTEGER,
			field: "id",
			primaryKey: true,
			allowNull: false,
		},
		gameId: {
			type: DataTypes.INTEGER,
			field: "game_id",
			allowNull: false,
		},
		title: {
			type: DataTypes.STRING,
			field: "title",
			allowNull: true,
		},
		coverImageId: {
			type: DataTypes.STRING(100),
			field: "cover_image_id",
			allowNull: true,
		},
		igdbUrl: {
			type: DataTypes.STRING,
			field: "igdb_url",
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
		tableName: "backlog_version",
		modelName: "BacklogVersion",
		timestamps: true,
	},
);

Game.hasMany(Version, { foreignKey: "gameId", as: "versions" });
Version.belongsTo(Game, { foreignKey: "gameId", as: "game" });
