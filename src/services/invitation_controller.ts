import UserService from "./user_service";
import EventType from '../enums/event_type'
import uuid from 'short-uuid';
import { sendEventToUser } from "../routes/events";
import Invitation from "../interfaces/invitation";
import UserStatus from "../enums/user_status";
import User from "../interfaces/user";

export default class InvitationController {
    private static invitations: Invitation[] = [];
    private static waitingUsers: User[] = []

    public static update = () => {
        this.waitingUsers  = UserService.getWaitingUsers();

        if (this.waitingUsers.length < 2) {
            return;
        }

        this.waitingUsers.forEach((user: User) => {
            const match: User | null = this.findFirstMatchForUser(user);

            if (match) {
                this.createInvitation(user, match);
            }
        });
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
        console.log(newInvitation);
        sendEventToUser(userA.id, EventType.INVITATION, JSON.stringify(newInvitation));
        sendEventToUser(userB.id, EventType.INVITATION, JSON.stringify(newInvitation));
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
    
}
