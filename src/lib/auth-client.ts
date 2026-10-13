import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { auth } from "./auth";

export const authClient = createAuthClient({
  // types the user's `role` field on the client
  plugins: [inferAdditionalFields<typeof auth>()],
});
