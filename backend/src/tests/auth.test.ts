import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";
import { authHeader, loginTestUser, registerTestUser, testPassword } from "./helpers.js";

describe("Auth API", () => {
  it("should register a new user", async () => {
    const { response } = await registerTestUser("USER", {
      name: "Normal User",
      email: "normal@test.com",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("User registered successfully");
    expect(response.body.data.user.email).toBe("normal@test.com");
    expect(response.body.data.user.role).toBe("USER");
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.user.password).toBeUndefined();
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("should not register duplicate email", async () => {
    await registerTestUser("USER", {
      name: "First User",
      email: "duplicate@test.com",
    });

    const response = await request(app).post("/api/auth/register").send({
      name: "Second User",
      email: "duplicate@test.com",
      password: testPassword,
      role: "USER",
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it("should login with valid credentials", async () => {
    const registered = await registerTestUser("USER", {
      email: "login@test.com",
    });

    const { response } = await loginTestUser(
      registered.payload.email,
      registered.payload.password
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("should reject login with invalid password", async () => {
    const registered = await registerTestUser("USER");

    const response = await request(app).post("/api/auth/login").send({
      email: registered.payload.email,
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should return current user with valid access token", async () => {
    const { accessToken, user } = await registerTestUser("USER");

    const response = await request(app)
      .get("/api/auth/me")
      .set(authHeader(accessToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(user.id);
    expect(response.body.data.email).toBe(user.email);
  });

  it("should reject current user request without access token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should refresh access token using refresh token cookie", async () => {
    const registered = await registerTestUser("USER");

    const response = await request(app)
      .post("/api/auth/refresh-token")
      .set("Cookie", registered.cookies);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("should logout and reject using the same refresh token again", async () => {
    const registered = await registerTestUser("USER");

    const logoutResponse = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", registered.cookies);

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body.success).toBe(true);

    const refreshResponse = await request(app)
      .post("/api/auth/refresh-token")
      .set("Cookie", registered.cookies);

    expect(refreshResponse.status).toBe(401);
    expect(refreshResponse.body.success).toBe(false);
  });

  it("should logout all user sessions", async () => {
    const registered = await registerTestUser("USER");

    const response = await request(app)
      .post("/api/auth/logout-all")
      .set(authHeader(registered.accessToken));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Logged out from all sessions successfully");
  });
});