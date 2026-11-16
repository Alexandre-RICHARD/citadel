const VIDEO_EXTENSIONS = new Set([
	"mkv",
	"mp4",
	"avi",
	"m4v",
	"mov",
	"wmv",
	"ts",
	"m2ts",
	"mpg",
	"mpeg",
	"webm",
	"iso",
]);

export function isVideoFile(filePath: string): boolean {
	return VIDEO_EXTENSIONS.has(filePath.split(".").at(-1)?.toLowerCase() ?? "");
}
