import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
};

export function createAccessToken(user: AuthUser) {
  const secret = process.env.JWT_SECRET ?? "development-secret";
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "8h";

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    },
    secret,
    { expiresIn }
  );
}

export function verifyAccessToken(token: string) {
  const secret = process.env.JWT_SECRET ?? "development-secret";
  const payload = jwt.verify(token, secret) as {
    sub: string;
    email: string;
    name: string;
    roles?: string[];
  };

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    roles: payload.roles ?? [],
  } satisfies AuthUser;
}

export async function hashPassword(value: string) {
  return bcrypt.hash(value, 10);
}

export async function comparePassword(value: string, hash: string) {
  return bcrypt.compare(value, hash);
}
