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

        for (let userAIndex = 0; userAIndex < this.waitingUsers.length - 1; userAIndex++) {
            for (let userBIndex = userAIndex + 1; userBIndex < this.waitingUsers.length; userBIndex++) {
                if (!UserService.isMatchAllowed(this.waitingUsers[userAIndex].id, this.waitingUsers[userBIndex].id)) {
                    continue;
                }

                InvitationController.createInvitation(userAIndex, userBIndex);
                break;
            }
        }
    };

    public static createInvitation = (userAIndex: number, userBIndex: number) => {
        const userA = this.waitingUsers[userAIndex];
        const userB = this.waitingUsers[userBIndex];

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

}
