import UserService from "./user_service";
import EventType from '../enums/event_type'
import uuid from 'short-uuid';
import { sendEventToUser } from "../routes/events";
import Invitation from "../interfaces/invitation";
import UserStatus from "../enums/user_status";

export default class InvitationController {
    private static invitations: Invitation[];

    public static update = () => {
        const waitingUsers = UserService.getWaitingUsers();

        if (waitingUsers.length < 2) {
            return;
        }

        waitingUsers.forEach((user) => {
            const otherUser = waitingUsers.find((u) => u.id !== user.id && UserService.isMatchAllowed(u.id, user.id));

            if (otherUser) {
                const newInvitation: Invitation = {
                    users: [user.id, otherUser.id],
                    id: uuid.generate(),
                    timestamp: Date.now(),
                }

                UserService.setStatus(user.id, UserStatus.INVITED)
                UserService.setStatus(otherUser.id, UserStatus.INVITED)

                InvitationController.invitations.push(newInvitation);
                console.log(newInvitation)
                sendEventToUser(user.id, EventType.INVITATION, JSON.stringify(newInvitation));
                sendEventToUser(otherUser.id, EventType.INVITATION, JSON.stringify(newInvitation));
            }
        });
    }
}
