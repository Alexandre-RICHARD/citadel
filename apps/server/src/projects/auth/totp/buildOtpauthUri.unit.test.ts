import { describe, expect, it } from "vitest";

import { buildOtpauthUri } from "./buildOtpauthUri.ts";

describe("buildOtpauthUri.ts", () => {
	describe("uri", () => {
		it("SHOULD give the issuer, the account and every TOTP parameter", () => {
			expect(
				buildOtpauthUri({
					issuer: "Citadel",
					accountName: "alex@example.com",
					secretBase32: "JBSWY3DPEHPK3PXP",
				}),
			).toBe(
				"otpauth://totp/Citadel:alex%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=Citadel&algorithm=SHA1&digits=6&period=30",
			);
		});

		it("SHOULD escape the label WHEN the issuer or the account holds a colon or a space", () => {
			const uri = buildOtpauthUri({
				issuer: "Mon site",
				accountName: "a:b@example.com",
				secretBase32: "AAAA",
			});

			expect(uri).toMatch(
				/^otpauth:\/\/totp\/Mon%20site:a%3Ab%40example\.com\?/u,
			);
			expect(new URL(uri).searchParams.get("issuer")).toBe("Mon site");
		});
	});
});
