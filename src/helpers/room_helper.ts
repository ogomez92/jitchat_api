import Invitation from "../interfaces/invitation";

export default class RoomHelper {
    public static generateRoom = (invitation: Invitation) => {
        return invitation.id;
    }
}
