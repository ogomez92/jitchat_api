import User from "./user";

interface Invitation {
    id: string;
    users: User[];
    timestamp: number;
    accepted?: string;
    declined?: string;
}

export default Invitation;
