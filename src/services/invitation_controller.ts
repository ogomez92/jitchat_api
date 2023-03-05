import UserService from "./user_service";
import EventType from '../enums/event_type'
import uuid from 'short-uuid';
import { sendEventToUser } from "../routes/events";
import Invitation from "../interfaces/invitation";
import UserStatus from "../enums/user_status";
import User from "../interfaces/user";

const EXPIRATION_TIME_IN_MILLISECONDS = 40000;

export default class InvitationController {
  private static invitations: Invitation[] = [];
  private static waitingUsers: User[] = []

  public static update = () => {
    this.purgeInvitations();

    UserService.purgeInactiveUsers();

    this.waitingUsers = UserService.getWaitingUsers();

    if (this.waitingUsers.length < 2) {
      return;
    }

    // shuffle the array
    for (let i = this.waitingUsers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.waitingUsers[i], this.waitingUsers[j]] = [this.waitingUsers[j], this.waitingUsers[i]];
    }

    const user = this.waitingUsers.shift();

    if (!user) {
      return;
    }

    const match: User | null = this.findFirstMatchForUser(user);

    if (match) {
      this.createInvitation(user, match);
    }
    
    this.update();
  };

  public static createInvitation = (userA: User, userB: User) => {
    const newInvitation: Invitation = {
      users: [userA, userB],
      id: uuid.generate(),
      timestamp: Date.now(),
    };

    UserService.setStatus(userA.id, UserStatus.INVITED);
    UserService.setStatus(userB.id, UserStatus.INVITED);

    InvitationController.invitations.push(newInvitation);
    sendEventToUser(userA.id, EventType.INVITATION, JSON.stringify(newInvitation));
    sendEventToUser(userB.id, EventType.INVITATION, JSON.stringify(newInvitation));
    console.log('invitation created')
  };

  public static isMatchAllowed = (userA: string, userB: string) => {
    if (userA === userB) {
      return false;
    }

    const blockedUsers = UserService.getBlockedUsers();

    if (blockedUsers[userA] && blockedUsers[userA].includes(userB)) {
      return false;
    }

    if (blockedUsers[userB] && blockedUsers[userB].includes(userA)) {
      return false;
    }

    return true;
  }

  public static findFirstMatchForUser = (user: User): User | null => {
    const waitingUsers = UserService.getWaitingUsers();

    for (const waitingUser of waitingUsers) {
      if (this.isMatchAllowed(user.id, waitingUser.id)) {
        return waitingUser;
      }
    }

    return null;
  }

  public static purgeInvitations = () => {
    const onlineUserIDs: string[] = UserService.getOnlineUserIDs();
    const currentDate = Date.now();

    InvitationController.invitations.forEach((invitation: Invitation) => {
      const userA: string = invitation.users[0].id;
      const userB: string = invitation.users[1].id;

      if (invitation.usersDeclined) {
        const decliner = invitation.usersDeclined.shift();
        const rejectedUser = invitation.users.find((user) => user.id !== decliner)

        if (rejectedUser && decliner) {
          sendEventToUser(rejectedUser.id, EventType.INVITATION_EXPIRED, invitation.id);
          UserService.blockUser(decliner, rejectedUser.id)
        }

        UserService.setStatus(userA, UserStatus.WAITING);
        UserService.setStatus(userB, UserStatus.WAITING);

        InvitationController.invitations.splice(InvitationController.invitations.indexOf(invitation), 1);
      }

      if (!onlineUserIDs.includes(userA)) {
        sendEventToUser(userB, EventType.INVITATION_EXPIRED, invitation.id);
        UserService.setStatus(userB, UserStatus.WAITING);
        InvitationController.invitations.splice(InvitationController.invitations.indexOf(invitation), 1);
      }

      if (!onlineUserIDs.includes(userB)) {
        sendEventToUser(userA, EventType.INVITATION_EXPIRED, invitation.id);
        UserService.setStatus(userA, UserStatus.WAITING);
        InvitationController.invitations.splice(InvitationController.invitations.indexOf(invitation), 1);
      }

      if (currentDate - invitation.timestamp > EXPIRATION_TIME_IN_MILLISECONDS) {
        sendEventToUser(userA, EventType.INVITATION_EXPIRED, invitation.id);
        sendEventToUser(userB, EventType.INVITATION_EXPIRED, invitation.id);

        UserService.purgeInactiveUsers();

        UserService.setStatus(userA, UserStatus.WAITING);
        UserService.setStatus(userB, UserStatus.WAITING);

        InvitationController.invitations.splice(InvitationController.invitations.indexOf(invitation), 1);
      }
    });
  }

  public static declineInvitation = (invitationID: string, userID: string) => {
    const invitation = this.findInvitationByID(invitationID);
    const user: User = UserService.getUserWithUUID(userID);

    if (!user) {
      return;
    }

    UserService.makeUserActive(userID);

    if (!invitation) {
      return;
    }

    if (!invitation.usersDeclined) {
      invitation.usersDeclined = [userID];
    } else {
      invitation.usersDeclined.push(userID);
    }
  }

  public static findInvitationByID = (invitationID: string): Invitation | undefined => this.invitations.find((invitation: Invitation) => invitation.id === invitationID);
}