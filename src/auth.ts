import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import prisma from "./lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password');
        }

        // Check for user first
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            password: true,
            is_email_verified: true,
            kyc_status: true,
            can_create_invoice: true,
          }
        });

        if (user) {
          const isPasswordValid = await compare(credentials.password, user.password);
          if (isPasswordValid) {
            return {
              id: user.id,
              email: user.email,
              role: "USER",
              is_email_verified: user.is_email_verified,
              kyc_status: user.kyc_status,
              can_create_invoice: user.can_create_invoice,
              permissions: []
            };
          }
        }

        // Check for admin
        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email },
          include: {
            claims: {
              include: {
                role: {
                  include: {  
                    permissions: {
                      include: {
                        permission: true
                      }
                    }
                  }
                },
                permission: true
              }
            }
          }
        });

        if (admin) {
          const isPasswordValid = await compare(credentials.password, admin.password);
          if (isPasswordValid) {
            const permissions = admin.claims.flatMap(claim => {
              const rolePermissions = claim.role?.permissions.flatMap(p => p.permission.action) ?? [];
              const directPermission = claim.permission?.action;
              return directPermission ? [...rolePermissions, directPermission] : rolePermissions;
            });

            return {
              id: admin.id,
              email: admin.email,
              role: "ADMIN",
              is_email_verified: true,
              kyc_status: "APPROVED",
              can_create_invoice: true,
              permissions
            };
          }
        }

        throw new Error('Invalid email or password');
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.is_email_verified = user.is_email_verified;
        token.kyc_status = user.kyc_status;
        token.can_create_invoice = user.can_create_invoice;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.is_email_verified = token.is_email_verified as boolean;
        session.user.kyc_status = token.kyc_status as "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
        session.user.can_create_invoice = token.can_create_invoice as boolean;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;