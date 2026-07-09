import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";
import { authHeader, createTaskPayload, createTestUserAndLogin } from "./helpers.js";

describe("Task listing, filtering, and pagination", () => {
    it("should return only own tasks for normal user", async () => {
        const userOne = await createTestUserAndLogin("USER", {
            email: "listone@test.com",
        });

        const userTwo = await createTestUserAndLogin("USER", {
            email: "listtwo@test.com",
        });

        await request(app)
            .post("/api/tasks")
            .set(authHeader(userOne.accessToken))
            .send(createTaskPayload({ title: "User One Task" }));

        await request(app)
            .post("/api/tasks")
            .set(authHeader(userTwo.accessToken))
            .send(createTaskPayload({ title: "User Two Task" }));

        const response = await request(app)
            .get("/api/tasks")
            .set(authHeader(userOne.accessToken));

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].title).toBe("User One Task");
        expect(response.body.data[0].ownerId).toBe(userOne.user.id);
    });

    it("should allow admin to view all tasks", async () => {
        const admin = await createTestUserAndLogin("ADMIN");
        const userOne = await createTestUserAndLogin("USER", {
            email: "adminlistone@test.com",
        });
        const userTwo = await createTestUserAndLogin("USER", {
            email: "adminlisttwo@test.com",
        });

        await request(app)
            .post("/api/tasks")
            .set(authHeader(userOne.accessToken))
            .send(createTaskPayload({ title: "First Task" }));

        await request(app)
            .post("/api/tasks")
            .set(authHeader(userTwo.accessToken))
            .send(createTaskPayload({ title: "Second Task" }));

        const response = await request(app)
            .get("/api/tasks")
            .set(authHeader(admin.accessToken));

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.pagination.totalItems).toBe(2);
    });

    it("should filter tasks by status", async () => {
        const admin = await createTestUserAndLogin("ADMIN");
        const normalUser = await createTestUserAndLogin("USER");

        await request(app)
            .post("/api/tasks")
            .set(authHeader(admin.accessToken))
            .send(
                createTaskPayload({
                    title: "Todo Task",
                    status: "TODO",
                    ownerId: normalUser.user.id,
                })
            );

        await request(app)
            .post("/api/tasks")
            .set(authHeader(admin.accessToken))
            .send(
                createTaskPayload({
                    title: "Completed Task",
                    status: "COMPLETED",
                    ownerId: normalUser.user.id,
                })
            );

        const response = await request(app)
            .get("/api/tasks?status=COMPLETED")
            .set(authHeader(admin.accessToken));

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].title).toBe("Completed Task");
        expect(response.body.data[0].status).toBe("COMPLETED");
    });

    it("should allow admin to filter tasks by ownerId", async () => {
        const admin = await createTestUserAndLogin("ADMIN");
        const userOne = await createTestUserAndLogin("USER", {
            email: "ownerone@test.com",
        });
        const userTwo = await createTestUserAndLogin("USER", {
            email: "ownertwo@test.com",
        });

        await request(app)
            .post("/api/tasks")
            .set(authHeader(admin.accessToken))
            .send(
                createTaskPayload({
                    title: "Owner One Task",
                    ownerId: userOne.user.id,
                })
            );

        await request(app)
            .post("/api/tasks")
            .set(authHeader(admin.accessToken))
            .send(
                createTaskPayload({
                    title: "Owner Two Task",
                    ownerId: userTwo.user.id,
                })
            );

        const response = await request(app)
            .get(`/api/tasks?ownerId=${userTwo.user.id}`)
            .set(authHeader(admin.accessToken));

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].title).toBe("Owner Two Task");
        expect(response.body.data[0].ownerId).toBe(userTwo.user.id);
    });

    it("should prevent normal user from filtering another user's tasks", async () => {
        const userOne = await createTestUserAndLogin("USER", {
            email: "filterone@test.com",
        });

        const userTwo = await createTestUserAndLogin("USER", {
            email: "filtertwo@test.com",
        });

        const response = await request(app)
            .get(`/api/tasks?ownerId=${userTwo.user.id}`)
            .set(authHeader(userOne.accessToken));

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
    });

    it("should return pagination metadata", async () => {
        const normalUser = await createTestUserAndLogin("USER");

        await request(app)
            .post("/api/tasks")
            .set(authHeader(normalUser.accessToken))
            .send(createTaskPayload({ title: "Task 1" }));

        await request(app)
            .post("/api/tasks")
            .set(authHeader(normalUser.accessToken))
            .send(createTaskPayload({ title: "Task 2" }));

        await request(app)
            .post("/api/tasks")
            .set(authHeader(normalUser.accessToken))
            .send(createTaskPayload({ title: "Task 3" }));

        const response = await request(app)
            .get("/api/tasks?page=1&limit=2")
            .set(authHeader(normalUser.accessToken));

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.pagination).toEqual({
            page: 1,
            limit: 2,
            totalItems: 3,
            totalPages: 2,
        });
    });
});
