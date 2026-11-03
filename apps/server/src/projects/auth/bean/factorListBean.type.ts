import type { FactorBean } from "./factorBean.type.ts";

export type FactorListBean = {
	factors: FactorBean[];
	remainingRecoveryCodes: number;
};
