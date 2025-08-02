import { DefaultUser, DefaultSession } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import { signIn } from "next-auth/react";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            accessToken: string;
            login?: string;
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
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            profile(profile, tokens) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    accessToken: tokens.access_token
                }
            },
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID ?? "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
            authorization: { params: { scope: "read:user user:email" } },
            profile(profile, tokens) {
                // console.log("providers :", profile ,tokens);
                return {
                    id: String(profile.id),
                    name: profile.name,
                    email: profile.email,
                    image: profile.avatar_url,
                    accessToken: tokens.access_token,
                    login: profile.login
                }
            },
        }),
        // CredentialsProvider({
        //     name: 'Credentials',
        //     credentials: {
        //         username: { label: 'email', type: 'text', placeholder: '' },
        //         password: { label: 'password', type: 'password', placeholder: '' },
        //     },
        //     async authorize(credentials: any) {

        //         return {
        //             id: "user1",
        //             name: "asd",
        //             userId: "asd",
        //             email: "ramdomEmail"
        //         };
        //     },
        // }),
    ],
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        jwt: async ({ user, token, account }: any) => {
            // console.log("jwt :", user,token,account);
            if (user) {
                token.uid = user.id;
            }
            if(account){
                token.accessToken = account.accessToken;
            }
            return token;
        },
        session: ({ session, user}: any) => {
            // console.log("session :", user,session);
            if (user.id) {
                session.user.id = user.id;
                session.user.accessToken = user.accessToken;
                session.user.login = user.login;
            }
            return session
        }
    },
    pages: {
        signIn: '/signin',
    }
}