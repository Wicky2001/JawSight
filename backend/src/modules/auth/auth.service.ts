import db from "../../sequelize_models/index.js";

import { GoogleProfile } from "./auth.types.js";

export const findOrCreateGoogleUser = async (
  profile: GoogleProfile,
) => {
  const googleId = profile.id;

  const email = profile.emails?.[0]?.value;

  if (!email) {
    throw new Error("Google email not found");
  }

  let user = await db.Doctor.findOne({
    where: {
      googleId,
    },
  });

  if (!user) {
    user = await db.Doctor.create({
      googleId,
      email,
    });
  }

  return user;
};