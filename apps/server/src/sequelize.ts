import { Sequelize } from "sequelize";

import { env } from "./env.ts";

export const sequelize = new Sequelize(
	env.DB_DATABASE_NAME,
	env.DB_USER_NAME,
	env.DB_USER_PASSWORD,
	{
		dialect: env.DB_DRIVER,
		host: env.DB_HOST,
		port: env.DB_PORT,
		timezone: "+00:00",
		/* eslint-disable-next-line no-console */
		logging: env.LOG_DB ? console.log : false,
		define: {
			underscored: true,
			charset: "utf8mb4",
			collate: "utf8mb4_unicode_520_ci",
		},
		pool: {
			max: 10,
			idle: 30000,
			acquire: 60000,
		},
	},
);
