import { Request, Response } from "express";
import EndpointError from "../enums/endpoint_error";
import UserStatus from "../enums/user_status";
import User from "../interfaces/user";
import { storageManager } from "../routes/";
import InputValidator from "../helpers/input_validator";
import uuid from 'short-uuid';

export default class UserService {
  public static usersOnline: Map<string, User> = new Map();

  public static addUserWithRequest = async (req: Request): Promise<User> => {
    const { id, username, intro } = req.body;

    if (!username || !intro) {
      throw new Error(EndpointError.INVALID_INPUT);
    }
    
    if (!UserService.validateNameAndIntro(username, intro)) {
      throw new Error(EndpointError.INVALID_INPUT);
    }

    const newUser: User = {
      id: id || uuid.generate(),
      username,
      intro,
      status: UserStatus.IDLE,
    };

    UserService.usersOnline.set(newUser.id, newUser);

    await UserService.storeUser(newUser);

    return newUser;
  };

  public static getOnlineUsers = (): number => UserService.usersOnline.size;

  public static getUserWithUUID = (id: string): User => {
    const user: User | undefined = UserService.usersOnline.get(id);

    if (!user) {
      const storedUser = storageManager.getKey(id);

      if (storedUser) {
        return storedUser;
      }

      throw new Error(EndpointError.USER_NOT_FOUND);
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
