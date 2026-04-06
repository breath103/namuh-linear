import { db } from "@/lib/db";
import { sendMagicLinkEmail } from "@/lib/email";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: false },
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // Generate a 6-digit code from the URL token
        const token = new URL(url).searchParams.get("token") ?? "";
        const code = token
          .replace(/[^0-9]/g, "")
          .slice(0, 6)
          .padEnd(6, "0");
        await sendMagicLinkEmail(email, code, url);
      },
      expiresIn: 600, // 10 minutes
    }),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3015"],
});
