import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import ConnectToDB from "./connect";
import User from "@/models/user";



export const authOptions = {
  // adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await ConnectToDB();

          // Special: Handle registration via credentials when explicitly requested
          if (credentials?.register === 'true') {
            const name = credentials?.name?.trim();
            const email = credentials?.email?.trim();
            const username = credentials?.username?.trim();
            const password = credentials?.password;
            const bio = credentials?.bio?.trim();

            console.log("Register data in nextAuth:", {
              name,
              email,
              username,
              password,
              bio
            })

            if (!name || !email || !username || !password) {
              throw new Error('Missing required fields for registration');
            }

            const existingByEmail = await User.findOne({ email });
            if (existingByEmail) {
              throw new Error('Email already in use');
            }

            const existingByUsername = await User.findOne({ username });
            if (existingByUsername) {
              throw new Error('Username already in use');
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
              name: name,
              username: username,
              email: email,
              password: hashedPassword,
              bio: bio
            });
            await newUser.save();

            return {
              id: newUser._id.toString(),
              name: newUser.name,
              email: newUser.email,
              username: newUser.username,
            };
          }

          // Default: sign-in via credentials
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing email or password");
          }

          const user = await User.findOne({ email: credentials.email }).select('+password');

          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.password) {
            throw new Error("Account uses social login. Please sign in with provider");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error("Invalid password");
          }

          return {
            name: user.name,
            id: user._id.toString(),
            email: user.email,
            username: user.username,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await ConnectToDB();

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // Create new user in our User collection
          const newUser = new User({
            username: user.name || user.email.split("@")[0],
            email: user.email,
            password: "", // No password for social login
            name: user.name || user.email.split("@")[0],
          });
          await newUser.save();
        } else {

          // updating existing user info if needed
          let needsUpdate = false;
          if (existingUser.username !== (user.name || user.email.split("@")[0])) {
            existingUser.username = user.name || user.email.split("@")[0];
            existingUser.name = user.name || user.email.split("@")[0];
            needsUpdate = true;
          }
          if (needsUpdate) {
            await existingUser.save();
          }
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.username = token.username;
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    signUp: '/register',
  },
  debug: process.env.NODE_ENV === 'development',
};
