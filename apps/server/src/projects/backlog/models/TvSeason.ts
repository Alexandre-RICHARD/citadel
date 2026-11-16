import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
	type NonAttribute,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import { TvShow } from "./TvShow.ts";

// Saison d'une série, commune à tous ; son id est celui de TMDB. La saison 0 réunit les épisodes spéciaux
export class TvSeason extends Model<
	InferAttributes<TvSeason>,
	InferCreationAttributes<TvSeason>
> {
	declare id: number;
	declare tvShowId: number;
	declare seasonNumber: number;
	declare name: string;
	declare airDate: string | null;
	declare posterPath: string | null;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare tvShow?: NonAttribute<TvShow>;
}

TvSeason.init(
	{
		id: {
			type: DataTypes.INTEGER,
			field: "id",
			primaryKey: true,
			allowNull: false,
		},
		tvShowId: {
			type: DataTypes.INTEGER,
			field: "tv_show_id",
			allowNull: false,
		},
		seasonNumber: {
			type: DataTypes.INTEGER,
			field: "season_number",
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
		posterPath: {
			type: DataTypes.STRING(100),
			field: "poster_path",
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
		tableName: "backlog_tv_season",
		modelName: "BacklogTvSeason",
		timestamps: true,
	},
);

TvShow.hasMany(TvSeason, { foreignKey: "tvShowId", as: "seasons" });
TvSeason.belongsTo(TvShow, { foreignKey: "tvShowId", as: "tvShow" });
