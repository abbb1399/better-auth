import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { nextCookies } from "better-auth/next-js";
import { sendPasswordResetEmail } from "../emails/password-reset";
import { sendEmailVerificationEmail } from "../emails/email-verification";
import { createAuthMiddleware } from "better-auth/api";
import { sendWelcomeEmail } from "../emails/welcome-email";
import { sendDeleteAccountVerificationEmail } from "../emails/delete-account-verification";
import { twoFactor } from "better-auth/plugins/two-factor";
import { admin as adminPlugin } from "better-auth/plugins/admin";
import { passkey } from "@better-auth/passkey";
import { ac, admin, user } from "@/components/auth/permissions";
import { organization } from "better-auth/plugins";
import { sendOrganizationInviteEmail } from "../emails/organization-invite-email";
import { and, desc, eq } from "drizzle-orm";
import { member } from "@/drizzle/schema";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { STRIPE_PLANS } from "./stripe";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const auth = betterAuth({
  appName: "Better Auth Demo",
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({
        user,
        url,
        newEmail,
      }: {
        user: { name: string; email: string };
        url: string;
        newEmail: string;
      }) => {
        await sendEmailVerificationEmail({
          user: { ...user, email: newEmail },
          url,
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await sendDeleteAccountVerificationEmail({ user, url });
      },
    },
    additionalFields: {
      favoriteNumber: { type: "number", required: true },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ user, url });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmailVerificationEmail({ user, url });
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      mapProfileToUser: (profile) => {
        return {
          favoriteNumber: Number(profile.public_repos) || 0,
        };
      },
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      mapProfileToUser: () => {
        return {
          favoriteNumber: 0,
        };
      },
    },
  },
  rateLimit: {
    storage: "database",
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60, // 1분
    },
  },
  plugins: [
    nextCookies(),
    twoFactor(),
    passkey(),
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
      },
    }),
    organization({
      sendInvitationEmail: async ({
        email,
        organization,
        inviter,
        invitation,
      }) =>
        await sendOrganizationInviteEmail({
          invitation,
          inviter: inviter.user,
          organization,
          email,
        }),
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      subscription: {
        authorizeReference: async ({ user, referenceId, action }) => {
          const memberItem = await db.query.member.findFirst({
            where: and(
              eq(member.organizationId, referenceId),
              eq(member.userId, user.id),
            ),
          });

          if (
            action === "upgrade-subscription" ||
            action === "cancel-subscription" ||
            action === "restore-subscription"
          ) {
            return memberItem?.role === "owner";
          }

          return memberItem != null;
        },
        enabled: true,
        plans: STRIPE_PLANS,
      },
    }),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-up")) {
        const user = ctx.context.newSession?.user ?? {
          name: ctx.body.name,
          email: ctx.body.email,
        };

        if (user != null) {
          await sendWelcomeEmail(user);
        }
      }
    }),
  },
  databaseHooks: {
    // 로그인할때마다
    session: {
      create: {
        before: async (userSession) => {
          const membership = await db.query.member.findFirst({
            where: eq(member.userId, userSession.userId),
            orderBy: desc(member.createdAt),
            columns: { organizationId: true },
          });

          return {
            data: {
              ...userSession,
              activeOrganizationId: membership?.organizationId,
            },
          };
        },
      },
    },
  },
});
