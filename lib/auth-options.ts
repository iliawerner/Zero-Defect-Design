import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().email('Укажите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
});

const demoUsers = (
  process.env.DEMO_USERS &&
  (() => {
    try {
      return JSON.parse(process.env.DEMO_USERS) as Array<{
        email: string;
        password: string;
        name?: string;
      }>;
    } catch (error) {
      console.warn('Не удалось распарсить DEMO_USERS:', error);
      return null;
    }
  })()
) || [
  {
    email: 'designer@example.com',
    password: 'design123',
    name: 'Demo Designer',
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'designer@example.com' },
        password: { label: 'Пароль', type: 'password' },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const match = demoUsers.find(
          (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password,
        );

        if (!match) {
          return null;
        }

        return {
          id: match.email,
          email: match.email,
          name: match.name ?? match.email,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.email && session.user) {
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? 'local-secret',
};
