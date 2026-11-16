import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
	type NonAttribute,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import { MediaCollection } from "./MediaCollection.ts";

// Film, commun à tous ; son id est celui de TMDB. `title` : le titre français, sinon l'original
export class Movie extends Model<
	InferAttributes<Movie>,
	InferCreationAttributes<Movie>
> {
	declare id: number;
	declare title: string;
	declare originalTitle: string;
	declare originalLanguage: string | null;
	declare releaseDate: string | null;
	declare runtimeMinutes: number | null;
	declare imdbId: string | null;
	declare posterPath: string | null;
	declare collectionId: number | null;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare collection?: NonAttribute<MediaCollection | null>;
}

Movie.init(
	{
		id: {
			type: DataTypes.INTEGER,
			field: "id",
			primaryKey: true,
			allowNull: false,
		},
		title: {
			type: DataTypes.STRING,
			field: "title",
			allowNull: false,
		},
		originalTitle: {
			type: DataTypes.STRING,
			field: "original_title",
			allowNull: false,
		},
		originalLanguage: {
			type: DataTypes.STRING(10),
			field: "original_language",
			allowNull: true,
		},
		releaseDate: {
			type: DataTypes.DATEONLY,
			field: "release_date",
			allowNull: true,
		},
		runtimeMinutes: {
			type: DataTypes.INTEGER,
			field: "runtime_minutes",
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
		collectionId: {
			type: DataTypes.INTEGER,
			field: "collection_id",
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
		tableName: "backlog_movie",
		modelName: "BacklogMovie",
		timestamps: true,
	},
);

Movie.belongsTo(MediaCollection, {
	foreignKey: "collectionId",
	as: "collection",
});
