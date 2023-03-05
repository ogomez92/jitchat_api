import User from "./user";

interface Invitation {
    id: string;
    users: User[];
    timestamp: number;
    usersAccepted?: string[];
    usersDeclined?: string[];
}

export default Invitation;
