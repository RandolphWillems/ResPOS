import test from "node:test";
import assert from "node:assert/strict";

import { createAccessToken, verifyAccessToken } from "./service.js";

test("createAccessToken and verifyAccessToken round-trip user data", () => {
  const user = {
    id: "user-1",
    email: "manager@respos.test",
    name: "Manager",
    roles: ["Manager", "Ober"],
  };

  const token = createAccessToken(user);
  const payload = verifyAccessToken(token);

  assert.equal(payload.id, user.id);
  assert.equal(payload.email, user.email);
  assert.deepEqual(payload.roles, user.roles);
});
