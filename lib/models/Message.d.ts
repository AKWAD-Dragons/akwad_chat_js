import { ChatAttachment } from "./ChatAttachment";
export declare class Message {
    id?: string;
    user_id?: string;
    text?: string;
    time?: Date;
    attachments?: ChatAttachment[];
    isDelivered?: boolean;
    index?: number;
    constructor(id?: string, user_id?: string, text?: string, time?: Date, attachments?: ChatAttachment[]);
}
