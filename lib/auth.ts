import NextAuth, { DefaultUser, DefaultSession, Session} from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        id: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        uid?: string;
    } 
}

export const NEXT_AUTH_CONFIG = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID ?? "",
            clientSecret: process.env.GITHUB_SECRET ?? ""
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            // profile(profile, tokens) {
            //     return {
            //         id: profile.sub,
            //         name: profile.name,
            //         email: profile.email,
            //         image: profile.picture,
            //     }
            // },
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: 'email', type: 'text', placeholder: '' },
                password: { label: 'password', type: 'password', placeholder: '' },
            },
            async authorize(credentials: any) {

                return {
                    id: "user1",
                    name: "asd",
                    userId: "asd",
                    email: "ramdomEmail"
                };
            },
        }),
    ],
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        jwt: async ({ user, token }: {
            user?: DefaultUser,
            token: JWT
        }) => {
            if (user) {
                token.uid = user.id;
            }
            return token;
        },
        session: ({ session, token }:{
            session: Session,
            token: JWT 
        }) => {
            if (session.user) {
                session.user.id = token.uid as string;
            }
            return session
        }
    },
    pages: {
        signIn: '/signin',
    }
}