import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import UserStatus from "../enums/user_status";
import User from "../interfaces/user";
import Language from "../enums/language";

export default class UserService {
  public static usersOnline: User[] = [];

  public static addUserWithRequest = (req: Request): User => {
    const { username, intro, languages } = req.body;

    if (!username || !intro || !languages) {
      throw new Error("Missing data");
    }

    const newUser: User = {
      id: uuid(),
      username,
      intro,
      languages,
      status: UserStatus.IDLE,
    };

    UserService.usersOnline.push(newUser);
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
      throw new Error("user not found");
    }

    return user;
  };
}
