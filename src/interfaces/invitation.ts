interface Invitation {
    id: string;
    users: string[];
    timestamp: number;
    accepted?: string;
    declined?: string;
}

export default Invitation;
