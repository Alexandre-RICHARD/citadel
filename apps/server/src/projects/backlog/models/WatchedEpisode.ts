import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

// Épisode vu par un compte : une ligne par épisode vu, aucune pour un épisode pas vu
export class WatchedEpisode extends Model<
	InferAttributes<WatchedEpisode>,
	InferCreationAttributes<WatchedEpisode>
> {
	declare userId: number;
	declare tvEpisodeId: number;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

WatchedEpisode.init(
	{
		userId: {
			type: DataTypes.INTEGER,
			field: "user_id",
			primaryKey: true,
			allowNull: false,
		},
		tvEpisodeId: {
			type: DataTypes.INTEGER,
			field: "tv_episode_id",
			primaryKey: true,
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
		tableName: "backlog_watched_episode",
		modelName: "BacklogWatchedEpisode",
		timestamps: true,
	},
);
