import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google,
        Credentials({
            name: "Admin Access",
            credentials: {
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const adminPassword = process.env.ADMIN_PASSWORD;

                if (credentials?.password === adminPassword) {
                    // Ensure Admin User exists in DB to satisfy foreign keys
                    const adminEmail = "admin@tradingjournal.com";

                    try {
                        let user = await prisma.user.findUnique({
                            where: { email: adminEmail }
                        });

                        if (!user) {
                            user = await prisma.user.create({
                                data: {
                                    email: adminEmail,
                                    name: "Admin Trader",
                                    image: null, // Could add a default avatar here
                                }
                            });
                        }

                        return user; // Return the database user object
                    } catch (error) {
                        console.error("Error ensuring admin user:", error);
                        return null;
                    }
                }
                return null;
            }
        })
    ],
    callbacks: {
        session({ session, user, token }) {
            // For Credentials provider, user info comes from token in JWT strategy usually, 
            // but with Prisma Adapter it might try database session. 
            // NextAuth + Prisma + Credentials usually forces JWT.
            // Let's ensure we handle both.

            if (session.user) {
                // If using database sessions (adapter), `user.id` is available.
                // If using JWT (likely for credentials), we need to map token.sub to session.user.id
                if (user?.id) {
                    session.user.id = user.id;
                } else if (token?.sub) {
                    session.user.id = token.sub;
                }
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        }
    },
    session: {
        strategy: "jwt", // Force JWT for simpler Credentials handling mixed with Google
    },
})
