import InputValidator from "./input_validator";

describe("input validation", () => {
  it("checks that a name with 4 characters is invalid", () => {
    const name = "1234";
    const result = InputValidator.isNameValid(name);
    expect(result).toBe(false);
  });

  it("tests that a 5 character name is valid", () => {
    const name = "12345";

    const result = InputValidator.isNameValid(name);

    expect(result).toBe(true);
  });

  it("tests that a 51 char name is invalid", () => {
    const name = new Array(52).join("a");

    const result = InputValidator.isNameValid(name);

    expect(result).toBe(false);
  });

  it("checks that short intros are invalid", () => {
    const intro = "1234";

    const result = InputValidator.isIntroValid(intro);

    expect(result).toBe(false);
  });

  it("checks that intro with 49 characters is invalid", () => {
    const intro = new Array(50).join("a");
    const result = InputValidator.isIntroValid(intro);

    expect(result).toBe(false);
  });

  it("checks that too long intros are invalid", () => {
    const intro = new Array(1002).join("a");

    const result = InputValidator.isIntroValid(intro);

    expect(result).toBe(false);
  });

  it("checks that a 64 char intro is valid", () => {
    const intro = new Array(64).join("a");

    const result = InputValidator.isIntroValid(intro);

    expect(result).toBe(true);
  });
});
