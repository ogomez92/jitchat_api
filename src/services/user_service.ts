import { Request, Response } from "express";
import EndpointError from "../enums/endpoint_error";
import UserStatus from "../enums/user_status";
import User from "../interfaces/user";
import { storageManager } from "../app";
import InputValidator from "../helpers/input_validator";
import uuid from 'short-uuid';

export default class UserService {
  public static usersOnline: Map<string, User> = new Map();
  private static blockedUsers: { [key: string]: string[] };

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

  public static storeUser = async (user: User): Promise<void> => {
    storageManager.setKey(user.id, user);
  };

  public static validateNameAndIntro = (
    name: string,
    intro: string
  ): boolean => {
    return (
      InputValidator.isNameValid(name) && InputValidator.isIntroValid(intro)
    );
  };

  public static disconnectUser = (withID: string) => {
    UserService.usersOnline.delete(withID);
  }

  public static setStatus = (userID: string, status: UserStatus) => {
    const user: User | undefined = UserService.getUserWithUUID(userID);

    if (!user) {
      throw new Error(EndpointError.USER_NOT_FOUND);
    }

    user.status = status;
    console.log('set status for ', user.id)

    // Ensure their online presence
    UserService.usersOnline.set(user.id, user);
  }

  public static getWaitingUsers = (): User[] => {
    const users: User[] = [];

    UserService.usersOnline.forEach((user: User) => {
      if (user.status === UserStatus.WAITING) {
        users.push(user);
      }
    });

    return users;
  }

  public static blockUser = (userA: string, userB: string) => {
    UserService.loadBlockedUsers();

    if (!UserService.blockedUsers[userA]) {
      UserService.blockedUsers[userA] = [];
    }

    UserService.blockedUsers[userA].push(userB);

    storageManager.setKey('blockedUsers', JSON.stringify(UserService.blockedUsers));
  }

  public static loadBlockedUsers = () => {
    if (!UserService.blockedUsers) {
      UserService.blockedUsers = storageManager.getKey('blockedUsers') || {};
      storageManager.setKey('blockedUsers', UserService.blockedUsers)
    }
  }

  public static getBlockedUsers = (): { [key: string]: string[] } => {
    this.loadBlockedUsers();
    return UserService.blockedUsers
  };
}
