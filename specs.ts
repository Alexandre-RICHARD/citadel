import { makeApi } from "@zodios/core";

import { otherTestSpecs } from "./specs/otherTest.specs.ts";
import { testSpecs } from "./specs/test.specs.ts";

const apiSpecs = makeApi([...otherTestSpecs, ...testSpecs] as const);

export default apiSpecs;
