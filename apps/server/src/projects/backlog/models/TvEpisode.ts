import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
	type NonAttribute,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import { TvSeason } from "./TvSeason.ts";

// Épisode d'une saison, commun à tous ; son id est celui de TMDB
export class TvEpisode extends Model<
	InferAttributes<TvEpisode>,
	InferCreationAttributes<TvEpisode>
> {
	declare id: number;
	declare tvSeasonId: number;
	declare episodeNumber: number;
	declare name: string;
	declare airDate: string | null;
	declare runtimeMinutes: number | null;
	declare stillPath: string | null;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare tvSeason?: NonAttribute<TvSeason>;
}

TvEpisode.init(
	{
		id: {
			type: DataTypes.INTEGER,
			field: "id",
			primaryKey: true,
			allowNull: false,
		},
		tvSeasonId: {
			type: DataTypes.INTEGER,
			field: "tv_season_id",
			allowNull: false,
		},
		episodeNumber: {
			type: DataTypes.INTEGER,
			field: "episode_number",
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			field: "name",
			allowNull: false,
		},
		airDate: {
			type: DataTypes.DATEONLY,
			field: "air_date",
			allowNull: true,
		},
		runtimeMinutes: {
			type: DataTypes.INTEGER,
			field: "runtime_minutes",
			allowNull: true,
		},
		stillPath: {
			type: DataTypes.STRING(100),
			field: "still_path",
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
		tableName: "backlog_tv_episode",
		modelName: "BacklogTvEpisode",
		timestamps: true,
	},
);

TvSeason.hasMany(TvEpisode, { foreignKey: "tvSeasonId", as: "episodes" });
TvEpisode.belongsTo(TvSeason, { foreignKey: "tvSeasonId", as: "tvSeason" });
