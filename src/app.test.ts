import request from "supertest";
import app from "./app";
import Language from "./enums/language";
import UserStatus from "./enums/user_status";

describe("App", () => {
  it("should respond with an error when status is called without a user", async () => {
    const response = await request(app).get("/status");
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("user not specified");
  });

  it('should respond with user not found if status is called with a non existant user', async () => {
    const response = await request(app).get('/status?id=foo');
    
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('error retrieving user');
  })

  it('successfully adds a new user, then retrieves its status', async () => {
    const userResponse = await request(app).post('/newuser').send({
      username: 'foo',
      intro: 'I am a test',
      language: Language.SPANISH,
    });

    expect(userResponse.status).toBe(200);

    expect(userResponse.body.username).toBe('foo');
    expect(userResponse.body.intro).toBe('I am a test');
    expect(userResponse.body.language).toBe(Language.SPANISH);
    expect(userResponse.body.id).toBeTruthy;

    const statusResponse = await request(app).get(`/status?id=${userResponse.body.id}`);

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.username).toBe('foo');
    expect(statusResponse.body.intro).toBe('I am a test');
    expect(statusResponse.body.language).toBe(Language.SPANISH);
    expect(statusResponse.body.status).toBe(UserStatus.IDLE)
  })
});
