import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";
import { authHeader, createTestUserAndLogin } from "./helpers.js";

describe("Users API", () => {
    it("should allow admin to retrieve normal users only", async () => {
        const admin = await createTestUserAndLogin("ADMIN", {
            name: "Admin User",
            email: "admin@test.com",
        });

        const userOne = await createTestUserAndLogin("USER", {
            name: "Alpha User",
            email: "alpha@test.com",
        });

        const userTwo = await createTestUserAndLogin("USER", {
            name: "Beta User",
            email: "beta@test.com",
        });

        const response = await request(app)
            .get("/api/users")
            .set(authHeader(admin.accessToken));

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Users retrieved successfully");

        const users = response.body.data;

        expect(users).toHaveLength(2);
        expect(users).toEqual([
            {
                id: userOne.user.id,
                name: "Alpha User",
            },
            {
                id: userTwo.user.id,
                name: "Beta User",
            },
        ]);

        expect(users.find((user: { id: number }) => user.id === admin.user.id)).toBeUndefined();
        expect(users[0].email).toBeUndefined();
        expect(users[0].role).toBeUndefined();
    });

    it("should reject normal user from retrieving users", async () => {
        const normalUser = await createTestUserAndLogin("USER");

        const response = await request(app)
            .get("/api/users")
            .set(authHeader(normalUser.accessToken));

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Access denied. Admin only.");
    });

    it("should reject request without access token", async () => {
        const response = await request(app).get("/api/users");

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});
