import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
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
import { Series } from "./Series.ts";

// Jeu du backlog : le jeu et sa personnalisation ; `createdAt` donne l'ordre d'ajout au backlog
export class UserGame extends Model<
	InferAttributes<UserGame>,
	InferCreationAttributes<UserGame>
> {
	declare gameId: number;
	declare imageId: string | null;
	declare endingType: EndingTypeEnum;
	declare seriesId: number | null;
	declare seriesNumber: number | null;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare game?: NonAttribute<Game>;
	declare series?: NonAttribute<Series | null>;
}

UserGame.init(
	{
		gameId: {
			type: DataTypes.INTEGER,
			field: "game_id",
			primaryKey: true,
			allowNull: false,
		},
		imageId: {
			type: DataTypes.STRING(100),
			field: "image_id",
			allowNull: true,
		},
		endingType: {
			type: DataTypes.STRING,
			field: "ending_type",
			allowNull: false,
		},
		seriesId: {
			type: DataTypes.INTEGER,
			field: "series_id",
			allowNull: true,
		},
		seriesNumber: {
			type: DataTypes.DECIMAL(7, 3),
			field: "series_number",
			allowNull: true,
			// Le pilote MariaDB rend un DECIMAL en texte ("3.100") pour ne rien perdre : 3 décimales tiennent dans un number
			get(this: UserGame): number | null {
				const value: unknown = this.getDataValue("seriesNumber");
				return value === null ? null : Number(value);
			},
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
		tableName: "backlog_user_game",
		modelName: "BacklogUserGame",
		timestamps: true,
	},
);

Game.hasOne(UserGame, { foreignKey: "gameId", as: "userGame" });
UserGame.belongsTo(Game, { foreignKey: "gameId", as: "game" });
UserGame.belongsTo(Series, { foreignKey: "seriesId", as: "series" });
