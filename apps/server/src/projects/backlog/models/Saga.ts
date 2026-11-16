import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

// Saga du backlog des médias : toujours à son compte, avec le nom de son choix (unique par compte)
export class Saga extends Model<
	InferAttributes<Saga>,
	InferCreationAttributes<Saga>
> {
	declare id: CreationOptional<number>;
	declare userId: number;
	declare name: string;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

Saga.init(
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
		tableName: "backlog_saga",
		modelName: "BacklogSaga",
		timestamps: true,
	},
);
