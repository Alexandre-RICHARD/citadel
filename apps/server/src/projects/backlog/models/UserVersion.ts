import type { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";
import {
	type CreationOptional,
	DataTypes,
	type InferAttributes,
	type InferCreationAttributes,
	Model,
	type NonAttribute,
} from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";
import type { DoneDlc } from "./DoneDlc.ts";
import { Platform } from "./Platform.ts";
import { Version } from "./Version.ts";

// Version jouée : une version sur une plateforme, unique par version + plateforme ; elle porte les données de jeu
export class UserVersion extends Model<
	InferAttributes<UserVersion>,
	InferCreationAttributes<UserVersion>
> {
	declare id: CreationOptional<number>;
	declare versionId: number;
	declare platformId: number;
	declare status: StatusEnum;
	declare isOwned: boolean;
	declare isUpNext: boolean;
	declare finishDate: string | null;
	declare sureFinishCount: number;
	declare probableFinishCount: number;
	declare trackedPlayTimeMinutes: number;
	declare estimatedPlayTimeMinutes: number;
	declare rating: number | null;
	declare comment: string | null;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare version?: NonAttribute<Version>;
	declare platform?: NonAttribute<Platform>;
	declare doneDlcs?: NonAttribute<DoneDlc[]>;
}

UserVersion.init(
	{
		id: {
			type: DataTypes.INTEGER,
			field: "id",
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		versionId: {
			type: DataTypes.INTEGER,
			field: "version_id",
			allowNull: false,
		},
		platformId: {
			type: DataTypes.INTEGER,
			field: "platform_id",
			allowNull: false,
		},
		status: {
			type: DataTypes.STRING,
			field: "status",
			allowNull: false,
		},
		isOwned: {
			type: DataTypes.BOOLEAN,
			field: "is_owned",
			allowNull: false,
		},
		isUpNext: {
			type: DataTypes.BOOLEAN,
			field: "is_up_next",
			allowNull: false,
		},
		finishDate: {
			type: DataTypes.DATEONLY,
			field: "finish_date",
			allowNull: true,
		},
		sureFinishCount: {
			type: DataTypes.INTEGER,
			field: "sure_finish_count",
			allowNull: false,
		},
		probableFinishCount: {
			type: DataTypes.INTEGER,
			field: "probable_finish_count",
			allowNull: false,
		},
		trackedPlayTimeMinutes: {
			type: DataTypes.INTEGER,
			field: "tracked_play_time_minutes",
			allowNull: false,
		},
		estimatedPlayTimeMinutes: {
			type: DataTypes.INTEGER,
			field: "estimated_play_time_minutes",
			allowNull: false,
		},
		rating: {
			type: DataTypes.TINYINT,
			field: "rating",
			allowNull: true,
		},
		comment: {
			type: DataTypes.TEXT,
			field: "comment",
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
		tableName: "backlog_user_version",
		modelName: "BacklogUserVersion",
		timestamps: true,
	},
);

UserVersion.belongsTo(Version, { foreignKey: "versionId", as: "version" });
UserVersion.belongsTo(Platform, { foreignKey: "platformId", as: "platform" });
