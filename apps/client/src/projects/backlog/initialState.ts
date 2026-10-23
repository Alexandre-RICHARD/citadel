/* eslint-disable prettier/prettier -- généré par le bouton « Copier l’état » du footer de debug, à coller tel quel */
import type { AppState } from "./types";

export const initialState = {
	"database": {
		"games": [],
		"versions": [],
		"versionPlatforms": [],
		"platforms": [
			{
				"id": 8,
				"shortName": "PS2",
				"technicalName": "ps2",
				"emulatedPlatformId": null
			},
			{
				"id": 9,
				"shortName": "PS3",
				"technicalName": "ps3",
				"emulatedPlatformId": null
			},
			{
				"id": -1,
				"shortName": "PCSX2",
				"technicalName": "pcsx2",
				"emulatedPlatformId": 8
			},
			{
				"id": -2,
				"shortName": "RPCS3",
				"technicalName": "rpcs3",
				"emulatedPlatformId": 9
			},
		],
		"dlcs": [],
		"series": [],
		"companies": [],
		"userGames": [],
		"userVersions": [],
		"doneDlcs": []
	},
	"searchQuery": "",
	"searchResults": [],
	"isSearchOpen": false,
	"modal": null,
	"popover": null,
	"isEditMode": true,
	"expandedGameIds": [],
	"columns": [
		{
			"key": "thumbnail",
			"isVisible": true
		},
		{
			"key": "series",
			"isVisible": true
		},
		{
			"key": "name",
			"isVisible": true
		},
		{
			"key": "seriesNumber",
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
			"key": "upNext",
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
	"sort": [
		{
			"column": "platform",
			"direction": "desc"
		}
	],
	"filters": [],
	"loadedPageCount": 1
} satisfies AppState;
