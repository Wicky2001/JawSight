import passport from "passport";

import {
  Strategy as GoogleStrategy,
} from "passport-google-oauth20";

import {
  findOrCreateGoogleUser,
} from "../../modules/auth/auth.service.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET!,

      callbackURL:
        `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },

    async (
      _googleAccessToken,
      _googleRefreshToken,
      profile,
      done,
    ) => {
      try {
        const user =
          await findOrCreateGoogleUser(profile);

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    },
  ),
);

export default passport;