import passport from "passport";
import passportJWT from "passport-jwt";
import { Request } from "express";

import {
  Strategy as GoogleStrategy,
} from "passport-google-oauth20";

import {
  findOrCreateGoogleUser,
} from "../../modules/auth/auth.service.js";


const JWTStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET as string;

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




const cookieExtractor = (req: Request) => {
  let jwtToken = null;
  if (req && req.cookies) {
    
    jwtToken = req.cookies["access-token"];
  }

  return jwtToken;
};

passport.use(
  "access-jwt",
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      secretOrKey: ACCESS_TOKEN_SECRET,
      algorithms: ["HS256"],
    },
    (jwtPayload, done) => {
      done(null, jwtPayload);
    },
  ),
);




export default passport;