import { createAuthClient } from "better-auth/react";
import { siwnClient } from "better-near-auth";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL || "", // Use relative URL in production
  plugins: [
    siwnClient({
      domain: "every-news-feed.near",
    }),
  ],
});
