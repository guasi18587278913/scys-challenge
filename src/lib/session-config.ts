import { SessionOptions } from "iron-session";

const password = process.env.SESSION_PASSWORD;

if (!password || password.length < 32) {
  throw new Error("SESSION_PASSWORD must be at least 32 characters long.");
}

export const sessionOptions: SessionOptions = {
  cookieName: "scys_session",
  password,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 天
  },
};
