import { describe, expect, it } from "vitest";

import { isSuspiciousPath } from "./isSuspiciousPath.ts";

describe("isSuspiciousPath.ts", () => {
	describe("scans", () => {
		it.each([
			"/wp-login.php",
			"/.env",
			"/api/.git/config",
			"/index.php?s=/index/think",
			"/cgi-bin/luci",
			"/static/../../etc/passwd",
			"/backup.sql",
			"/PHPMYADMIN/",
		])("SHOULD flag the path WHEN it is %s", (path) => {
			expect(isSuspiciousPath(path)).toBe(true);
		});
	});

	describe("normal traffic", () => {
		it.each([
			"/",
			"/backlog",
			"/api/games?search=zelda",
			"/app-3f2a1c.js",
			"/assets/images/logo-12ab.png",
			"/.well-known/acme-challenge/token",
			"/web/index.html",
		])("SHOULD not flag the path WHEN it is %s", (path) => {
			expect(isSuspiciousPath(path)).toBe(false);
		});
	});
});
