import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import UserStatus from "../enums/user_status";
import User from "../interfaces/user";
import Language from "../enums/language";

export default class UserService {
  public static usersOnline: User[] = [];

  public static addUserWithRequest = (req: Request): User => {
    const { username, intro, language } = req.body;

    if (!username || !intro || !language) {
      throw new Error("Missing data");
    }

    const newUser: User = {
      id: uuid(),
      username,
      intro,
      language,
      status: UserStatus.IDLE,
    };

    UserService.usersOnline.push(newUser);
    console.log(
      `New user added! ${newUser} we now have ${UserService.getNumberOfOnlineUsers()}`
    );
    return newUser;
  };

  public static getNumberOfOnlineUsers = (): number =>
    UserService.usersOnline.length;

  public static getUserWithUUID = (id: string): User => {
    const user = UserService.usersOnline.find((user) => user.id === id);

    if (!user) {
      throw new Error("user not found");
    }

    return user;
  };
}
