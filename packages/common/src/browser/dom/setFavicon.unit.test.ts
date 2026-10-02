import { beforeEach, describe, expect, it } from "vitest";

import { setFavicon } from "./setFavicon.ts";

describe("setFavicon.ts", () => {
	beforeEach(() => {
		document.head.innerHTML = "";
	});

	describe("favicon link replacement", () => {
		it("SHOULD add a single icon link WHEN the page has none", () => {
			expect(document.head.querySelectorAll("link[rel='icon']")).toHaveLength(
				0,
			);

			setFavicon("/favicon/test.ico");

			const links = document.head.querySelectorAll("link[rel='icon']");
			expect(links).toHaveLength(1);

			const link = links[0] as HTMLLinkElement;
			expect(link.getAttribute("href")).toBe("/favicon/test.ico");
			expect(link.getAttribute("rel")).toBe("icon");
			expect(link.getAttribute("type")).toBe("image/x-icon");
		});

		it("SHOULD remove every existing icon link before adding the new one", () => {
			document.head.innerHTML = `
      <link rel="icon" href="/favicon/old1.ico" />
      <link rel="icon" href="/favicon/old2.ico" />
    `;
			expect(document.head.querySelectorAll("link[rel='icon']")).toHaveLength(
				2,
			);

			setFavicon("/favicon/new.ico");

			const icons = document.head.querySelectorAll("link[rel='icon']");
			expect(icons).toHaveLength(1);
			expect((icons[0] as HTMLLinkElement).getAttribute("href")).toBe(
				"/favicon/new.ico",
			);
		});

		it("SHOULD do nothing WHEN the href is empty", () => {
			document.head.innerHTML = `<link rel="icon" href="/favicon/existing.ico" />`;

			setFavicon("");

			const icons = document.head.querySelectorAll("link[rel='icon']");
			expect(icons).toHaveLength(1);
			expect((icons[0] as HTMLLinkElement).getAttribute("href")).toBe(
				"/favicon/existing.ico",
			);
		});

		it("SHOULD keep only the last icon WHEN called several times", () => {
			setFavicon("/favicon/a.ico");
			setFavicon("/favicon/b.ico");

			const icons = document.head.querySelectorAll("link[rel='icon']");
			expect(icons).toHaveLength(1);
			expect((icons[0] as HTMLLinkElement).getAttribute("href")).toBe(
				"/favicon/b.ico",
			);
		});
	});
});
