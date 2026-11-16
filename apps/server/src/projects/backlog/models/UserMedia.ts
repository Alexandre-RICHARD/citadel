import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
	type NonAttribute,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import { Movie } from "./Movie.ts";
import { Saga } from "./Saga.ts";
import { TvShow } from "./TvShow.ts";

/**
 * Média du backlog d'un compte : un film (`movieId`) ou une série (`tvShowId`), jamais les deux, et ce que le compte en
 * dit. `isWatched` ne sert qu'aux films : une série est vue par ses épisodes (WatchedEpisode). `createdAt` donne
 * l'ordre d'ajout au backlog
 */
export class UserMedia extends Model<
	InferAttributes<UserMedia>,
	InferCreationAttributes<UserMedia>
> {
	declare id: CreationOptional<number>;
	declare userId: number;
	declare movieId: number | null;
	declare tvShowId: number | null;
	declare imagePath: string | null;
	declare sagaId: number | null;
	declare sagaNumber: number | null;
	declare isWatched: CreationOptional<boolean>;
	declare isUpNext: CreationOptional<boolean>;
	declare isInProgress: CreationOptional<boolean>;
	declare comment: CreationOptional<string | null>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare movie?: NonAttribute<Movie | null>;
	declare tvShow?: NonAttribute<TvShow | null>;
	declare saga?: NonAttribute<Saga | null>;
}

UserMedia.init(
	{
		id: {
			type: DataTypes.INTEGER,
			field: "id",
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		userId: {
			type: DataTypes.INTEGER,
			field: "user_id",
			allowNull: false,
		},
		movieId: {
			type: DataTypes.INTEGER,
			field: "movie_id",
			allowNull: true,
		},
		tvShowId: {
			type: DataTypes.INTEGER,
			field: "tv_show_id",
			allowNull: true,
		},
		imagePath: {
			type: DataTypes.STRING(100),
			field: "image_path",
			allowNull: true,
		},
		sagaId: {
			type: DataTypes.INTEGER,
			field: "saga_id",
			allowNull: true,
		},
		sagaNumber: {
			type: DataTypes.DECIMAL(7, 3),
			field: "saga_number",
			allowNull: true,
			// Le pilote MariaDB rend un DECIMAL en texte ("3.100") pour ne rien perdre : 3 décimales tiennent dans un number
			get(this: UserMedia): number | null {
				const value: unknown = this.getDataValue("sagaNumber");
				return value === null ? null : Number(value);
			},
		},
		isWatched: {
			type: DataTypes.BOOLEAN,
			field: "is_watched",
			allowNull: false,
			defaultValue: false,
		},
		isUpNext: {
			type: DataTypes.BOOLEAN,
			field: "is_up_next",
			allowNull: false,
			defaultValue: false,
		},
		isInProgress: {
			type: DataTypes.BOOLEAN,
			field: "is_in_progress",
			allowNull: false,
			defaultValue: false,
		},
		comment: {
			type: DataTypes.TEXT,
			field: "comment",
			allowNull: true,
			defaultValue: null,
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
		tableName: "backlog_user_media",
		modelName: "BacklogUserMedia",
		timestamps: true,
	},
);

UserMedia.belongsTo(Movie, { foreignKey: "movieId", as: "movie" });
UserMedia.belongsTo(TvShow, { foreignKey: "tvShowId", as: "tvShow" });
UserMedia.belongsTo(Saga, { foreignKey: "sagaId", as: "saga" });
