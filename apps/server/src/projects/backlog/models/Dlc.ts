import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import { Game } from "./Game.ts";

// DLC ou extension ; id IGDB, rattaché au jeu et non à une version
export class Dlc extends Model<
	InferAttributes<Dlc>,
	InferCreationAttributes<Dlc>
> {
	declare id: number;
	declare gameId: number;
	declare name: string;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

Dlc.init(
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
		name: {
			type: DataTypes.STRING,
			field: "name",
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
		tableName: "backlog_dlc",
		modelName: "BacklogDlc",
		timestamps: true,
	},
);

Game.hasMany(Dlc, { foreignKey: "gameId", as: "dlcs" });
