import { useState } from "react";

import type { Boss, GamesList } from "./game.type";

const initialGames: GamesList = [
	{
		id: 1,
		name: "Elden Ring",
		startedAt: "2025-02-14T10:00:00.000Z",
		endedAt: null,
		bosses: [
			{
				id: 3,
				gameId: 1,
				name: "Margit, le Présage Fêlé",
				defeatedAt: "2025-02-16T21:12:00.000Z",
				deaths: [
					{
						id: 7,
						bossId: 3,
						date: "2025-02-14T20:03:00.000Z",
						comment: "Roulade ratée sur le combo double faux",
					},
					{
						id: 8,
						bossId: 3,
						date: "2025-02-15T19:40:00.000Z",
						comment: "",
					},
					{
						id: 9,
						bossId: 3,
						date: "2025-02-16T21:00:00.000Z",
						comment: "Presque, il ne restait qu'un tiers de vie",
					},
				],
			},
			{
				id: 4,
				gameId: 1,
				name: "Malenia, Lame de Miquella",
				defeatedAt: null,
				deaths: [
					{
						id: 10,
						bossId: 4,
						date: "2025-03-01T18:20:00.000Z",
						comment: "Waterfowl Dance imparable",
					},
					{
						id: 11,
						bossId: 4,
						date: "2025-03-01T18:34:00.000Z",
						comment: "",
					},
					{
						id: 12,
						bossId: 4,
						date: "2025-03-02T20:11:00.000Z",
						comment: "Ragequit après la phase 2",
					},
					{
						id: 13,
						bossId: 4,
						date: "2025-03-03T19:02:00.000Z",
						comment: "",
					},
				],
			},
		],
	},
	{
		id: 2,
		name: "Sekiro: Shadows Die Twice",
		startedAt: "2024-11-02T09:00:00.000Z",
		endedAt: "2025-01-05T22:40:00.000Z",
		bosses: [
			{
				id: 5,
				gameId: 2,
				name: "Genichiro Ashina",
				defeatedAt: "2024-11-20T21:05:00.000Z",
				deaths: [
					{
						id: 14,
						bossId: 5,
						date: "2024-11-18T20:00:00.000Z",
						comment: "Oubli du parry sur la charge",
					},
					{
						id: 15,
						bossId: 5,
						date: "2024-11-19T21:15:00.000Z",
						comment: "",
					},
				],
			},
			{
				id: 6,
				gameId: 2,
				name: "Isshin, le Sabreur Ashina",
				defeatedAt: "2025-01-05T22:38:00.000Z",
				deaths: [
					{
						id: 16,
						bossId: 6,
						date: "2024-12-28T22:00:00.000Z",
						comment: "Phase 3, foudre non parée",
					},
					{
						id: 17,
						bossId: 6,
						date: "2024-12-30T21:47:00.000Z",
						comment: "",
					},
					{
						id: 18,
						bossId: 6,
						date: "2025-01-04T23:10:00.000Z",
						comment: "À un coup près",
					},
				],
			},
		],
	},
];

export function useHomepage() {
	const [id, setId] = useState(19);
	const [games, setGames] = useState(initialGames);
	const [expandedGameIds, setExpandedGameIds] = useState<Set<number>>(
		new Set([1]),
	);
	const [expandedBossIds, setExpandedBossIds] = useState<Set<number>>(
		new Set(),
	);

	function getNewId(): number {
		const newId = id;
		setId((prev) => prev + 1);
		return newId;
	}

	function toggleGameExpand(gameId: number) {
		setExpandedGameIds((prev) => {
			const next = new Set(prev);

			if (next.has(gameId)) {
				next.delete(gameId);
			} else {
				next.add(gameId);
			}

			return next;
		});
	}

	function toggleBossExpand(bossId: number) {
		setExpandedBossIds((prev) => {
			const next = new Set(prev);

			if (next.has(bossId)) {
				next.delete(bossId);
			} else {
				next.add(bossId);
			}

			return next;
		});
	}

	function submitNewGame(name: string, callback?: () => void) {
		const trimmed = name.trim();
		if (!trimmed) return;
		const game = {
			id: getNewId(),
			name: trimmed,
			startedAt: new Date().toISOString(),
			endedAt: null,
			bosses: [],
		};
		setGames((prev) => [game, ...prev]);
		setExpandedGameIds((prev) => new Set(prev).add(game.id));
		callback?.();
	}

	function onUpdateGame(gameId: number, gamePatch: { name: string }) {
		setGames((prev) =>
			prev.map((g) => (g.id === gameId ? { ...g, ...gamePatch } : g)),
		);
	}

	function onDeleteGame(gameId: number) {
		setGames((prev) => prev.filter((g) => g.id !== gameId));
	}

	function onToggleFinished(gameId: number) {
		setGames((prev) =>
			prev.map((g) =>
				g.id === gameId
					? { ...g, endedAt: g.endedAt ? null : new Date().toISOString() }
					: g,
			),
		);
	}

	function onAddBoss(gameId: number, bossName: string) {
		const boss: Boss = {
			id: getNewId(),
			gameId,
			name: bossName,
			defeatedAt: null,
			deaths: [],
		};
		setGames((prev) =>
			prev.map((g) =>
				g.id === gameId ? { ...g, bosses: [...g.bosses, boss] } : g,
			),
		);
	}

	function onUpdateBoss(
		gameId: number,
		bossId: number,
		patch: { name: string },
	) {
		setGames((prev) =>
			prev.map((g) =>
				g.id !== gameId
					? g
					: {
							...g,
							bosses: g.bosses.map((b) =>
								b.id === bossId ? { ...b, ...patch } : b,
							),
						},
			),
		);
	}

	function onDeleteBoss(gameId: number, bossId: number) {
		setGames((prev) =>
			prev.map((g) =>
				g.id !== gameId
					? g
					: { ...g, bosses: g.bosses.filter((b) => b.id !== bossId) },
			),
		);
	}

	function onToggleDefeated(gameId: number, bossId: number) {
		setGames((prev) =>
			prev.map((g) =>
				g.id !== gameId
					? g
					: {
							...g,
							bosses: g.bosses.map((b) =>
								b.id === bossId
									? {
											...b,
											defeatedAt: b.defeatedAt
												? null
												: new Date().toISOString(),
										}
									: b,
							),
						},
			),
		);
	}

	function onAddDeath(gameId: number, bossId: number) {
		const death = {
			id: getNewId(),
			bossId,
			date: new Date().toISOString(),
			comment: null,
		};
		setGames((prev) =>
			prev.map((g) =>
				g.id !== gameId
					? g
					: {
							...g,
							bosses: g.bosses.map((b) =>
								b.id === bossId ? { ...b, deaths: [...b.deaths, death] } : b,
							),
						},
			),
		);
	}

	function onUpdateDeath(
		gameId: number,
		bossId: number,
		deathId: number,
		patch: {
			comment: string | null;
			date: string;
		},
	) {
		setGames((prev) =>
			prev.map((g) =>
				g.id !== gameId
					? g
					: {
							...g,
							bosses: g.bosses.map((b) =>
								b.id !== bossId
									? b
									: {
											...b,
											deaths: b.deaths.map((d) =>
												d.id === deathId ? { ...d, ...patch } : d,
											),
										},
							),
						},
			),
		);
	}

	function onDeleteDeath(gameId: number, bossId: number, deathId: number) {
		setGames((prev) =>
			prev.map((g) =>
				g.id !== gameId
					? g
					: {
							...g,
							bosses: g.bosses.map((b) =>
								b.id !== bossId
									? b
									: {
											...b,
											deaths: b.deaths.filter((d) => d.id !== deathId),
										},
							),
						},
			),
		);
	}

	const grandTotal = games.reduce(
		(sum, g) => sum + g.bosses.reduce((s, b) => s + b.deaths.length, 0),
		0,
	);

	return {
		submitNewGame,
		games,
		expandedGameIds,
		expandedBossIds,
		toggleGameExpand,
		toggleBossExpand,
		onUpdateGame,
		onDeleteGame,
		onToggleFinished,
		onAddBoss,
		onUpdateBoss,
		onDeleteBoss,
		onToggleDefeated,
		onAddDeath,
		onUpdateDeath,
		onDeleteDeath,
		grandTotal,
	};
}
