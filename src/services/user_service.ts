import { Request, Response } from "express";
import EndpointError from "../enums/endpoint_error";
import { closeConnectionForUser } from "../routes/events";
import UserStatus from "../enums/user_status";
import User from "../interfaces/user";
import { storageManager } from "../app";
import InputValidator from "../helpers/input_validator";
import uuid from "short-uuid";
import InvitationController from "./invitation_controller";

const USER_MAX_IDLE_TIME = 40000;

export default class UserService {
  public static usersOnline: Map<string, User> = new Map();
  private static userActivityTimestamps: Map<string, number> = new Map();
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

    UserService.userActivityTimestamps.set(newUser.id, Date.now());
    return newUser;
  };

  public static getOnlineUsers = (): number => UserService.usersOnline.size;

  public static getUserWithUUID = (id: string): User => {
    const user: User | undefined = UserService.usersOnline.get(id);

    if (!user) {
      const storedUser: User = storageManager.getKey(id);

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
  };

  public static setStatus = (userID: string, status: UserStatus) => {
    const user: User | undefined = UserService.getUserWithUUID(userID);

    if (!user) {
      throw new Error(EndpointError.USER_NOT_FOUND);
    }

    user.status = status;

    // Ensure their online presence
    UserService.usersOnline.set(user.id, user);
  };

  public static getWaitingUsers = (): User[] => {
    const users: User[] = [];

    UserService.usersOnline.forEach((user: User) => {
      if (user.status === UserStatus.WAITING) {
        users.push(user);
      }
    });

    return users;
  };

  public static blockUser = (blocker: string, blocked: string) => {
    UserService.loadBlockedUsers();

    if (!UserService.blockedUsers[blocker]) {
      UserService.blockedUsers[blocker] = [];
    }

    UserService.blockedUsers[blocker].push(blocked);

    // storageManager.setKey('blockedUsers', UserService.blockedUsers);
  };

  public static loadBlockedUsers = () => {
    // const blockedUsers = storageManager.getKey('blockedUsers');

    if (!UserService.blockedUsers) {
      UserService.blockedUsers = {};
      return;
    }

    // storageManager.setKey('blockedUsers', UserService.blockedUsers)
  };

  public static getBlockedUsers = (): { [key: string]: string[] } => {
    this.loadBlockedUsers();
    return UserService.blockedUsers;
  };

  public static getOnlineUserIDs = (): string[] => {
    const ids: string[] = [];

    UserService.usersOnline.forEach((user: User) => {
      ids.push(user.id);
    });

    return ids;
  };

  public static makeUserActive = (id: string) => {
    UserService.userActivityTimestamps.set(id, Date.now());
  };

  public static purgeInactiveUsers = () => {
    // Waiting users are not considered inactive, so update their timestamps
    UserService.getWaitingUsers().forEach((user: User) =>
      this.makeUserActive(user.id)
    );

    UserService.userActivityTimestamps.forEach(
      (timestamp: number, id: string) => {
        if (Date.now() - timestamp > USER_MAX_IDLE_TIME) {
          UserService.disconnectUser(id);
          UserService.userActivityTimestamps.delete(id);
          closeConnectionForUser(id);
        }
      }
    );
  };

  public static clearBlockedUsers = () => (this.blockedUsers = {});

  public static getTotalUsers = () => {
    const data = storageManager.getData();

    // get the size of data
    return Object.keys(data).length;
  };
}
