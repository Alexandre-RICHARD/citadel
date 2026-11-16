import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

// Collection TMDB, commune à tous : elle ne sert qu'à proposer une saga ; son id est celui de TMDB
export class MediaCollection extends Model<
	InferAttributes<MediaCollection>,
	InferCreationAttributes<MediaCollection>
> {
	declare id: number;
	declare name: string;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

MediaCollection.init(
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
		tableName: "backlog_media_collection",
		modelName: "BacklogMediaCollection",
		timestamps: true,
	},
);
