import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import { Saga } from "./Saga.ts";

// Collection TMDB reliée à une saga d'un compte : un film de cette collection propose la saga. Une seule saga par
// collection et par compte (clé primaire user_id, collection_id)
export class SagaCollection extends Model<
	InferAttributes<SagaCollection>,
	InferCreationAttributes<SagaCollection>
> {
	declare userId: number;
	declare collectionId: number;
	declare sagaId: number;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

SagaCollection.init(
	{
		userId: {
			type: DataTypes.INTEGER,
			field: "user_id",
			primaryKey: true,
			allowNull: false,
		},
		collectionId: {
			type: DataTypes.INTEGER,
			field: "collection_id",
			primaryKey: true,
			allowNull: false,
		},
		sagaId: {
			type: DataTypes.INTEGER,
			field: "saga_id",
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
		tableName: "backlog_saga_collection",
		modelName: "BacklogSagaCollection",
		timestamps: true,
	},
);

Saga.hasMany(SagaCollection, { foreignKey: "sagaId", as: "collections" });
