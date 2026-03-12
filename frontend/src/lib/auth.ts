import NextAuth, { CredentialsSignin } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { checkLoginAttempt, recordLoginFailure, clearLoginAttempts } from '@/lib/login-limiter';

class EmailNotVerifiedError extends CredentialsSignin {
    code = 'EMAIL_NOT_VERIFIED' as const;
}

class TooManyAttemptsError extends CredentialsSignin {
    code = 'TOO_MANY_ATTEMPTS' as const;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'jwt' },

    providers: [
        // Google OAuth (only register if env vars are set)
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [Google({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            })]
            : []),

        // Email + Password
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const email = credentials.email as string;

                // Brute-force protection
                const { allowed } = await checkLoginAttempt(email);
                if (!allowed) {
                    throw new TooManyAttemptsError();
                }

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user || !user.passwordHash) {
                    await recordLoginFailure(email);
                    return null;
                }

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.passwordHash,
                );

                if (!isValid) {
                    await recordLoginFailure(email);
                    return null;
                }

                if (!user.emailVerified) {
                    throw new EmailNotVerifiedError();
                }

                // Login success — clear failed attempts
                await clearLoginAttempts(email);

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user, trigger, session: updateData }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
            }
            if (trigger === 'update' && updateData) {
                if (updateData.name) token.name = updateData.name;
                if (updateData.email) token.email = updateData.email;
                if (updateData.image) token.picture = updateData.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            if (token.name) session.user.name = token.name as string;
            if (token.email) session.user.email = token.email as string;
            if (token.picture) session.user.image = token.picture as string;
            return session;
        },
    },

    pages: {
        signIn: '/login',
        error: '/login',
    },
});
