export function setFavicon(href: string) {
	if (!href) return;
	const { head } = document;
	head.querySelectorAll("link[rel='icon']").forEach((node) => node.remove());
	const link = document.createElement("link");
	link.rel = "icon";
	link.href = href;
	link.type = "image/x-icon";
	head.appendChild(link);
}
