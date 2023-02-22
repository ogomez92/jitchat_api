import request from "supertest";
import app from "./app";

describe("App", () => {
  it("should respond with an error when status is called without a user", async () => {
    const response = await request(app).get("/status");
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("user not specified");
  });
});
