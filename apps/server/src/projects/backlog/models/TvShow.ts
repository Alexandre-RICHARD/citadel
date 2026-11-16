import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

// Série, commune à tous ; son id est celui de TMDB. `isOngoing` : TMDB en attend encore des épisodes
export class TvShow extends Model<
	InferAttributes<TvShow>,
	InferCreationAttributes<TvShow>
> {
	declare id: number;
	declare name: string;
	declare originalName: string;
	declare originalLanguage: string | null;
	declare firstAirDate: string | null;
	declare imdbId: string | null;
	declare posterPath: string | null;
	declare isOngoing: boolean;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

TvShow.init(
	{
		id: {
			type: DataTypes.INTEGER,
			field: "id",
			primaryKey: true,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			field: "name",
			allowNull: false,
		},
		originalName: {
			type: DataTypes.STRING,
			field: "original_name",
			allowNull: false,
		},
		originalLanguage: {
			type: DataTypes.STRING(10),
			field: "original_language",
			allowNull: true,
		},
		firstAirDate: {
			type: DataTypes.DATEONLY,
			field: "first_air_date",
			allowNull: true,
		},
		imdbId: {
			type: DataTypes.STRING(20),
			field: "imdb_id",
			allowNull: true,
		},
		posterPath: {
			type: DataTypes.STRING(100),
			field: "poster_path",
			allowNull: true,
		},
		isOngoing: {
			type: DataTypes.BOOLEAN,
			field: "is_ongoing",
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
		tableName: "backlog_tv_show",
		modelName: "BacklogTvShow",
		timestamps: true,
	},
);
