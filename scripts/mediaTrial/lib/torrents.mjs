// Les torrents de qBittorrent, reliés aux fichiers par leur inode, et leur état de partage.
// Seul le nom d'hôte d'un tracker est gardé : son adresse complète contient la clé personnelle (passkey).
import { folders, toHostPath } from "./fileList.mjs";
import { gigabytes } from "./text.mjs";

const trackerStatus = { notContacted: 1, working: 2, updating: 3, notWorking: 4 };

// Du meilleur au pire : l'état de partage d'un média est le meilleur de ses torrents (§5)
export const sharingStates = ["Partage en cours", "En seed", "Pas encore contacté", "Tracker injoignable", "Mort", "En erreur", "Sans tracker"];

function trackerHost(url) {
	try {
		return new URL(url).hostname;
	} catch {
		return "adresse illisible";
	}
}

function joinPath(folder, name) {
	return `${folder.replace(/[\\/]+$/, "")}/${name}`;
}

// Un tracker qui ne répond à aucun torrent est injoignable : ses torrents sont inactifs, pas morts
function workingHosts(entries) {
	const hosts = new Set();
	for (const { trackers } of entries) {
		for (const tracker of trackers) if (tracker.status === trackerStatus.working) hosts.add(trackerHost(tracker.url));
	}
	return hosts;
}

export function classifyTorrent(torrent, trackers, reachableHosts) {
	if (["error", "missingFiles"].includes(torrent.state)) return "En erreur";
	if (!trackers.length) return "Sans tracker";
	if (trackers.some((tracker) => tracker.status === trackerStatus.working)) return torrent.upspeed > 0 ? "Partage en cours" : "En seed";
	if (trackers.some((tracker) => [trackerStatus.notContacted, trackerStatus.updating].includes(tracker.status))) return "Pas encore contacté";
	return trackers.some((tracker) => reachableHosts.has(trackerHost(tracker.url))) ? "Mort" : "Tracker injoignable";
}

export function bestSharingState(torrents) {
	const ranks = torrents.map((torrent) => sharingStates.indexOf(torrent.state));
	return ranks.length ? sharingStates[Math.min(...ranks)] : "Non présent";
}

export function indexTorrents(entries, fileList) {
	const reachableHosts = workingHosts(entries);
	const torrents = entries.map(({ torrent, files, trackers }) => {
		const hostPaths = files.map((file) => toHostPath(joinPath(torrent.save_path, file.name)));
		return {
			hash: torrent.hash,
			name: torrent.name,
			category: torrent.category,
			tags: torrent.tags,
			addedOn: new Date(torrent.added_on * 1000).toISOString().slice(0, 10),
			progress: Math.round(torrent.progress * 1000) / 10,
			sizeGb: gigabytes(torrent.size),
			hosts: [...new Set(trackers.map((tracker) => trackerHost(tracker.url)))],
			// Deux adresses d'un même tracker au même palier sont annoncées toutes les deux (§8, étape 2)
			tiers: trackers.map((tracker) => `${trackerHost(tracker.url)} [${tracker.tier}]`).join(" | ") || undefined,
			messages: [...new Set(trackers.map((tracker) => tracker.msg).filter(Boolean))],
			state: classifyTorrent(torrent, trackers, reachableHosts),
			isOther: hostPaths.some((hostPath) => hostPath.startsWith(folders.otherTorrents)),
			hostPaths,
			inodes: hostPaths.map((hostPath) => fileList?.get(hostPath)?.inode).filter(Boolean),
			missingFromFileList: hostPaths.filter((hostPath) => fileList && !fileList.get(hostPath)).length,
		};
	});
	const byInode = new Map();
	for (const torrent of torrents) {
		for (const inode of torrent.inodes) {
			if (!byInode.has(inode)) byInode.set(inode, []);
			if (!byInode.get(inode).includes(torrent)) byInode.get(inode).push(torrent);
		}
	}
	const byHash = new Map(torrents.map((torrent) => [torrent.hash, torrent]));
	return { torrents, byInode, byHash };
}
