// Compteurs cumulés de temps CPU (nanosecondes ou « jiffies », peu importe : seul leur
// écart compte) : celui du conteneur ou des processus, et celui de toute la machine
export type CpuSample = {
	used: number;
	total: number;
};
