import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
	type NonAttribute,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import type { Boss } from "./Boss.ts";

export class Game extends Model<
	InferAttributes<Game>,
	InferCreationAttributes<Game>
> {
	declare id: CreationOptional<number>;
	declare name: string;
	declare endedAt: CreationOptional<Date | null>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare bosses?: NonAttribute<Boss[]>;
}

Game.init(
	{
		id: {
			type: DataTypes.INTEGER,
			field: "id",
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			field: "name",
			allowNull: false,
		},
		endedAt: {
			type: DataTypes.DATE(3),
			field: "ended_at",
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
		tableName: "game",
		modelName: "Game",
		timestamps: true,
	},
);
