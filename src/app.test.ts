import request from "supertest";
import app from "./app";
import Language from "./enums/language";
import UserStatus from "./enums/user_status";
import EndpointError from "./enums/endpoint_error";

const GOOD_INTRO = new Array(52).join('a');

describe("Status, no users", () => {
  it("should respond with an error when status is called without a user", async () => {
    const response = await request(app).get("/status");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(EndpointError.USER_NOT_SPECIFIED);
  });

  it("should respond with user not found if status is called with a non existant user", async () => {
    const response = await request(app).get("/status?id=foo");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe(EndpointError.USER_RETRIEVAL);
  });

  it("returns an empty object for online users when no users are added", async () => {
    const response = await request(app).get("/onlineusers");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({});
  });
});

describe("invalid user creation", () => {
  it("should respond with an error when no username is specified", async () => {
    const response = await request(app)
      .post("/newuser")
      .send({
        intro: GOOD_INTRO,
        languages: [Language.SPANISH],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(EndpointError.INVALID_INPUT);
  });

  it("should respond with an error when no intro is specified", async () => {
    const response = await request(app)
      .post("/newuser")
      .send({
        username: "oriol",
        languages: [Language.SPANISH],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(EndpointError.INVALID_INPUT);
  });

  it("should respond with an error when no languages are specified", async () => {
    const response = await request(app).post("/newuser").send({
      username: "oriol",
      intro: GOOD_INTRO,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(EndpointError.INVALID_INPUT);
  });

  it("should respond with an error when username is short", async () => {
    const response = await request(app)
      .post("/newuser")
      .send({
        username: "asdf",
        intro: GOOD_INTRO,
        languages: [Language.SPANISH],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(EndpointError.INVALID_INPUT);
  });

  it("should respond with an error when intro is short", async () => {
    const response = await request(app)
      .post("/newuser")
      .send({
        username: "oriol",
        intro: "I am a test",
        languages: [Language.SPANISH],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(EndpointError.INVALID_INPUT);
  });
});

describe("user creation", () => {
  it("successfully adds a new user, then retrieves its status", async () => {
    const userResponse = await request(app)
      .post("/newuser")
      .send({
        username: "oriol",
        intro: GOOD_INTRO,
        languages: [Language.SPANISH],
      });

    expect(userResponse.status).toBe(200);
    expect(userResponse.body.username).toBe("oriol");
    expect(userResponse.body.intro).toBe(GOOD_INTRO);
    expect(userResponse.body.languages).toContain(Language.SPANISH);

    const statusResponse = await request(app).get(
      `/status?id=${userResponse.body.id}`
    );

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.username).toBe("oriol");
    expect(statusResponse.body.intro).toBe(GOOD_INTRO);
    expect(statusResponse.body.languages).toContain(Language.SPANISH);
    expect(statusResponse.body.status).toBe(UserStatus.IDLE);
  });

  it("retrieves online users expecting 1 in Spanish", async () => {
    const onlineUsers = await request(app).get("/onlineusers");

    expect(onlineUsers.status).toBe(200);
    expect(onlineUsers.body[Language.SPANISH]).toBe(1);
  });
});
