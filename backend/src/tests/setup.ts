import dotenv from "dotenv";
import { afterAll, beforeAll, beforeEach } from "vitest";

dotenv.config({
    path: ".env.test",
    override: true,
});

let prisma: (typeof import("../config/prisma.js"))["default"];

beforeAll(async () => {
    prisma = (await import("../config/prisma.js")).default;
});

beforeEach(async () => {
    await prisma.authSession.deleteMany();
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
});

afterAll(async () => {
    await prisma.$disconnect();
});