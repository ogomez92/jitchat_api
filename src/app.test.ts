import request from "supertest";
import app from "./app";
import Language from "./enums/language";
import UserStatus from "./enums/user_status";

describe("Status, no users", () => {
  it("should respond with an error when status is called without a user", async () => {
    const response = await request(app).get("/status");
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("user not specified");
  });

  it("should respond with user not found if status is called with a non existant user", async () => {
    const response = await request(app).get("/status?id=foo");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("error retrieving user");
  });

  it("returns an empty object for online users when no users are added", async () => {
    const response = await request(app).get("/onlineusers");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({});
  });
});

describe("user creation", () => {
  it("successfully adds a new user, then retrieves its status", async () => {
    const userResponse = await request(app)
      .post("/newuser")
      .send({
        username: "foo",
        intro: "I am a test",
        languages: [Language.SPANISH],
      });

    expect(userResponse.status).toBe(200);

    expect(userResponse.body.username).toBe("foo");
    expect(userResponse.body.intro).toBe("I am a test");
    expect(userResponse.body.languages).toContain(Language.SPANISH);

    const statusResponse = await request(app).get(
      `/status?id=${userResponse.body.id}`
    );

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.username).toBe("foo");
    expect(statusResponse.body.intro).toBe("I am a test");
    expect(statusResponse.body.languages).toContain(Language.SPANISH);
    expect(statusResponse.body.status).toBe(UserStatus.IDLE);
  });

  it("retrieves online users expecting 1 in Spanish", async () => {
    const onlineUsers = await request(app).get("/onlineusers");
    
    expect(onlineUsers.status).toBe(200);
    expect(onlineUsers.body[Language.SPANISH]).toBe(1);
  });
});
