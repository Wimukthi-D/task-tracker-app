import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma.js";

const password = "password123";

const main = async () => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: {
            email: "admin@test.com",
        },
        update: {
            name: "Admin User",
            password: hashedPassword,
            role: "ADMIN",
        },
        create: {
            name: "Admin User",
            email: "admin@test.com",
            password: hashedPassword,
            role: "ADMIN",
        },
    });

    const userOne = await prisma.user.upsert({
        where: {
            email: "user@test.com",
        },
        update: {
            name: "Test User",
            password: hashedPassword,
            role: "USER",
        },
        create: {
            name: "Test User",
            email: "user@test.com",
            password: hashedPassword,
            role: "USER",
        },
    });

    const userTwo = await prisma.user.upsert({
        where: {
            email: "jane@test.com",
        },
        update: {
            name: "Jane User",
            password: hashedPassword,
            role: "USER",
        },
        create: {
            name: "Jane User",
            email: "jane@test.com",
            password: hashedPassword,
            role: "USER",
        },
    });

    await prisma.task.deleteMany({
        where: {
            title: {
                in: [
                    "Prepare assignment review",
                    "Complete frontend polish",
                    "Review task filters",
                    "Test realtime notifications",
                ],
            },
        },
    });

    await prisma.task.createMany({
        data: [
            {
                title: "Prepare assignment review",
                description:
                    "Review the full-stack task tracker implementation before submission.",
                status: "TODO",
                dueDate: new Date("2026-12-31T00:00:00.000Z"),
                ownerId: userOne.id,
            },
            {
                title: "Complete frontend polish",
                description:
                    "Check accordion UI, create dialog, edit form, and admin assigned user dropdown.",
                status: "IN_PROGRESS",
                dueDate: new Date("2026-11-30T00:00:00.000Z"),
                ownerId: userOne.id,
            },
            {
                title: "Review task filters",
                description:
                    "Confirm status filtering, owner filtering, and pagination work correctly.",
                status: "COMPLETED",
                dueDate: new Date("2026-10-15T00:00:00.000Z"),
                ownerId: userTwo.id,
            },
            {
                title: "Test realtime notifications",
                description:
                    "Verify create, update, and delete task events are received without refreshing.",
                status: "TODO",
                dueDate: new Date("2026-12-15T00:00:00.000Z"),
                ownerId: userTwo.id,
            },
        ],
    });

    console.log("Seed completed successfully.");
    console.log("");
    console.log("Login credentials:");
    console.log(`Admin: admin@test.com / ${password}`);
    console.log(`User:  user@test.com / ${password}`);
    console.log(`User:  jane@test.com / ${password}`);
    console.log("");
    console.log("Created users:");
    console.log(`Admin ID: ${admin.id}`);
    console.log(`User ID: ${userOne.id}`);
    console.log(`Jane ID: ${userTwo.id}`);
};

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });