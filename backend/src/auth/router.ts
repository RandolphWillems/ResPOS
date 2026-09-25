import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { comparePassword, createAccessToken, hashPassword, type AuthUser } from "./service.js";
import type { AuthenticatedRequest } from "./middleware.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  roleName: z.string().default("Ober"),
});

export const authRouter = Router();

function toAuthUser(user: {
  id: string;
  email: string;
  name: string;
  roles: { role: { name: string } }[];
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles.map((entry) => entry.role.name),
  };
}

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { roles: { include: { role: true } } },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const validPassword = await comparePassword(parsed.data.password, user.passwordHash);

  if (!validPassword) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const authUser = toAuthUser(user);
  const token = createAccessToken(authUser);

  return res.json({
    token,
    user: {
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      roles: authUser.roles,
    },
  });
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid registration payload." });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (existingUser) {
    return res.status(409).json({ message: "A user with this email already exists." });
  }

  const role = await prisma.role.upsert({
    where: { name: parsed.data.roleName },
    update: {},
    create: { name: parsed.data.roleName },
  });

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      roles: {
        create: [{ roleId: role.id }],
      },
    },
    include: { roles: { include: { role: true } } },
  });

  return res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((entry) => entry.role.name),
    },
  });
});

authRouter.get("/me", async (req, res) => {
  const request = req as AuthenticatedRequest;
  const user = request.user;

  if (!user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  return res.json({ user });
});
