/* eslint-disable prettier/prettier -- généré par le bouton « Exporter l'état » du footer de debug, à coller tel quel */
import type { AppState } from "./types";

export const initialState = {
	"database": {
		"games": [],
		"versions": [],
		"versionPlatforms": [],
		"platforms": [
			{
				"id": 8,
				"name": "PS2",
				"technicalName": "ps2",
				"emulatedPlatformId": null
			},
			{
				"id": 9,
				"name": "PS3",
				"technicalName": "ps3",
				"emulatedPlatformId": null
			},
			{
				"id": -1,
				"name": "PCSX2",
				"technicalName": "pcsx2",
				"emulatedPlatformId": 8
			},
			{
				"id": -2,
				"name": "RPCS3",
				"technicalName": "rpcs3",
				"emulatedPlatformId": 9
			}
		],
		"dlcs": [],
		"series": [],
		"franchises": [],
		"companies": [],
		"alternativeNames": [],
		"variants": [],
		"variantDlcs": []
	},
	"searchQuery": "",
	"searchResults": [],
	"modal": null,
	"popover": null,
	"isEditMode": false,
	"expandedGameIds": [],
	"columns": [
		{
			"key": "thumbnail",
			"isVisible": true
		},
		{
			"key": "name",
			"isVisible": true
		},
		{
			"key": "series",
			"isVisible": true
		},
		{
			"key": "seriesNumber",
			"isVisible": true
		},
		{
			"key": "franchise",
			"isVisible": true
		},
		{
			"key": "developer",
			"isVisible": true
		},
		{
			"key": "publisher",
			"isVisible": true
		},
		{
			"key": "releaseDate",
			"isVisible": true
		},
		{
			"key": "endingType",
			"isVisible": true
		},
		{
			"key": "platform",
			"isVisible": true
		},
		{
			"key": "status",
			"isVisible": true
		},
		{
			"key": "playSoon",
			"isVisible": true
		},
		{
			"key": "owned",
			"isVisible": true
		},
		{
			"key": "finishDate",
			"isVisible": true
		},
		{
			"key": "finishCount",
			"isVisible": true
		},
		{
			"key": "dlc",
			"isVisible": true
		},
		{
			"key": "trackedPlayTime",
			"isVisible": true
		},
		{
			"key": "estimatedPlayTime",
			"isVisible": true
		},
		{
			"key": "totalPlayTime",
			"isVisible": true
		},
		{
			"key": "rating",
			"isVisible": true
		},
		{
			"key": "comment",
			"isVisible": true
		},
		{
			"key": "actions",
			"isVisible": true
		}
	],
	"sort": [],
	"filters": [],
	"loadedPageCount": 1
} satisfies AppState;
