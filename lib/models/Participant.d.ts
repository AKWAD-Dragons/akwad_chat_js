export interface ParticipantParams {
    id?: string;
    name: string;
    permissions?: string[];
}
export declare class Participant {
    id?: string;
    name: string;
    meta_data?: Object;
    last_seen_message?: string;
    rooms?: string[];
    permissions?: string[];
    constructor(params: ParticipantParams);
}
