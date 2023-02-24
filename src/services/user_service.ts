import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import UserStatus from "../enums/user_status";
import User from "../interfaces/user";
import Language from "../enums/language";
import { storageManager } from "../app";
import InputValidator from "../helpers/input_validator";

export default class UserService {
  public static usersOnline: User[] = [];

  public static addUserWithRequest = async (req: Request): Promise<User> => {
    const { username, intro, languages } = req.body;

    if (!username || !intro || !languages) {
      throw new Error("invalid input");
    }
    
    if (!UserService.validateNameAndIntro(username, intro)) {
      throw new Error("invalid input");
    }

    const newUser: User = {
      id: uuid(),
      username,
      intro,
      languages,
      status: UserStatus.IDLE,
    };

    UserService.usersOnline.push(newUser);

    await UserService.storeUser(newUser);

    console.log(
      `New user added! ${newUser} online users: ${UserService.getOnlineUsersByLanguage()}`
    );
    return newUser;
  };

  public static getOnlineUsersByLanguage = (): Map<string, number> => {
    const languages = new Map<string, number>();

    UserService.usersOnline.forEach((user) => {
      user.languages.forEach((language) => {
        if (languages.has(language)) {
          languages.set(language, languages.get(language)! + 1);
        } else {
          languages.set(language, 1);
        }
      });
    });

    return languages;
  };

  public static getUserWithUUID = (id: string): User => {
    const user = UserService.usersOnline.find((user) => user.id === id);

    if (!user) {
      const storedUser = storageManager.getKey(id);

      if (storedUser) {
        return storedUser;
      }

      throw new Error("user not found");
    }

    return user;
  };

  private static storeUser = async (user: User): Promise<void> => {
    await storageManager.setKey(user.id, user);
  };

  public static validateNameAndIntro = (
    name: string,
    intro: string
  ): boolean => {
    return (
      InputValidator.isNameValid(name) && InputValidator.isIntroValid(intro)
    );
  };
}
