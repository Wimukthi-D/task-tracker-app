import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";
import { authHeader, createTaskPayload, createTestUserAndLogin } from "./helpers.js";

describe("Task RBAC", () => {
    it("should allow user to create own task", async () => {
        const normalUser = await createTestUserAndLogin("USER");

        const response = await request(app)
            .post("/api/tasks")
            .set(authHeader(normalUser.accessToken))
            .send(createTaskPayload());

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe("Test Task");
        expect(response.body.data.ownerId).toBe(normalUser.user.id);
        expect(response.body.data.owner.name).toBe(normalUser.user.name);
    });

    it("should prevent user from creating task for another owner", async () => {
        const userOne = await createTestUserAndLogin("USER", {
            email: "userone@test.com",
        });

        const userTwo = await createTestUserAndLogin("USER", {
            email: "usertwo@test.com",
        });

        const response = await request(app)
            .post("/api/tasks")
            .set(authHeader(userOne.accessToken))
            .send(
                createTaskPayload({
                    ownerId: userTwo.user.id,
                })
            );

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
    });

    it("should prevent user from viewing another user's task", async () => {
        const userOne = await createTestUserAndLogin("USER", {
            email: "owner@test.com",
        });

        const userTwo = await createTestUserAndLogin("USER", {
            email: "other@test.com",
        });

        const createdTask = await request(app)
            .post("/api/tasks")
            .set(authHeader(userOne.accessToken))
            .send(createTaskPayload());

        const response = await request(app)
            .get(`/api/tasks/${createdTask.body.data.id}`)
            .set(authHeader(userTwo.accessToken));

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
    });

    it("should allow admin to view another user's task", async () => {
        const admin = await createTestUserAndLogin("ADMIN");
        const normalUser = await createTestUserAndLogin("USER");

        const createdTask = await request(app)
            .post("/api/tasks")
            .set(authHeader(normalUser.accessToken))
            .send(createTaskPayload());

        const response = await request(app)
            .get(`/api/tasks/${createdTask.body.data.id}`)
            .set(authHeader(admin.accessToken));

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(createdTask.body.data.id);
        expect(response.body.data.ownerId).toBe(normalUser.user.id);
    });

    it("should allow admin to create a task for a selected user", async () => {
        const admin = await createTestUserAndLogin("ADMIN");
        const normalUser = await createTestUserAndLogin("USER");

        const response = await request(app)
            .post("/api/tasks")
            .set(authHeader(admin.accessToken))
            .send(
                createTaskPayload({
                    title: "Admin Assigned Task",
                    ownerId: normalUser.user.id,
                })
            );

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe("Admin Assigned Task");
        expect(response.body.data.ownerId).toBe(normalUser.user.id);
    });

    it("should allow admin to update another user's task", async () => {
        const admin = await createTestUserAndLogin("ADMIN");
        const normalUser = await createTestUserAndLogin("USER");

        const createdTask = await request(app)
            .post("/api/tasks")
            .set(authHeader(normalUser.accessToken))
            .send(createTaskPayload());

        const response = await request(app)
            .patch(`/api/tasks/${createdTask.body.data.id}`)
            .set(authHeader(admin.accessToken))
            .send({
                title: "Updated by Admin",
                status: "IN_PROGRESS",
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe("Updated by Admin");
        expect(response.body.data.status).toBe("IN_PROGRESS");
    });

    it("should prevent user from updating another user's task", async () => {
        const userOne = await createTestUserAndLogin("USER", {
            email: "taskowner@test.com",
        });

        const userTwo = await createTestUserAndLogin("USER", {
            email: "blocked@test.com",
        });

        const createdTask = await request(app)
            .post("/api/tasks")
            .set(authHeader(userOne.accessToken))
            .send(createTaskPayload());

        const response = await request(app)
            .patch(`/api/tasks/${createdTask.body.data.id}`)
            .set(authHeader(userTwo.accessToken))
            .send({
                title: "Should Not Update",
            });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
    });

    it("should prevent user from changing task owner", async () => {
        const userOne = await createTestUserAndLogin("USER", {
            email: "first@test.com",
        });

        const userTwo = await createTestUserAndLogin("USER", {
            email: "second@test.com",
        });

        const createdTask = await request(app)
            .post("/api/tasks")
            .set(authHeader(userOne.accessToken))
            .send(createTaskPayload());

        const response = await request(app)
            .patch(`/api/tasks/${createdTask.body.data.id}`)
            .set(authHeader(userOne.accessToken))
            .send({
                ownerId: userTwo.user.id,
            });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
    });

    it("should allow user to delete own task", async () => {
        const normalUser = await createTestUserAndLogin("USER");

        const createdTask = await request(app)
            .post("/api/tasks")
            .set(authHeader(normalUser.accessToken))
            .send(createTaskPayload());

        const response = await request(app)
            .delete(`/api/tasks/${createdTask.body.data.id}`)
            .set(authHeader(normalUser.accessToken));

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Task deleted successfully");
    });

    it("should prevent user from deleting another user's task", async () => {
        const userOne = await createTestUserAndLogin("USER", {
            email: "deleteowner@test.com",
        });

        const userTwo = await createTestUserAndLogin("USER", {
            email: "deleteblocked@test.com",
        });

        const createdTask = await request(app)
            .post("/api/tasks")
            .set(authHeader(userOne.accessToken))
            .send(createTaskPayload());

        const response = await request(app)
            .delete(`/api/tasks/${createdTask.body.data.id}`)
            .set(authHeader(userTwo.accessToken));

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
    });
});
