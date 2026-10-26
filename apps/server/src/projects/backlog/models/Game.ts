import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
	type NonAttribute,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import { Company } from "./Company.ts";
import type { Dlc } from "./Dlc.ts";
import { Series } from "./Series.ts";
import type { UserGame } from "./UserGame.ts";
import type { Version } from "./Version.ts";

// Jeu : l'œuvre. Son id est celui de sa fiche IGDB originale, qui est aussi sa version originale
export class Game extends Model<
	InferAttributes<Game>,
	InferCreationAttributes<Game>
> {
	declare id: number;
	declare name: string;
	declare frenchName: string | null;
	declare firstReleaseDate: string | null;
	declare isCancelled: boolean;
	declare proposedSeriesId: number | null;
	declare developerId: number | null;
	declare publisherId: number | null;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare proposedSeries?: NonAttribute<Series | null>;
	declare developer?: NonAttribute<Company | null>;
	declare publisher?: NonAttribute<Company | null>;
	declare versions?: NonAttribute<Version[]>;
	declare dlcs?: NonAttribute<Dlc[]>;
	declare userGame?: NonAttribute<UserGame | null>;
}

Game.init(
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
		frenchName: {
			type: DataTypes.STRING,
			field: "french_name",
			allowNull: true,
		},
		firstReleaseDate: {
			type: DataTypes.DATEONLY,
			field: "first_release_date",
			allowNull: true,
		},
		isCancelled: {
			type: DataTypes.BOOLEAN,
			field: "is_cancelled",
			allowNull: false,
		},
		proposedSeriesId: {
			type: DataTypes.INTEGER,
			field: "proposed_series_id",
			allowNull: true,
		},
		developerId: {
			type: DataTypes.INTEGER,
			field: "developer_id",
			allowNull: true,
		},
		publisherId: {
			type: DataTypes.INTEGER,
			field: "publisher_id",
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
		tableName: "backlog_game",
		modelName: "BacklogGame",
		timestamps: true,
	},
);

Game.belongsTo(Series, {
	foreignKey: "proposedSeriesId",
	as: "proposedSeries",
});
Game.belongsTo(Company, { foreignKey: "developerId", as: "developer" });
Game.belongsTo(Company, { foreignKey: "publisherId", as: "publisher" });
