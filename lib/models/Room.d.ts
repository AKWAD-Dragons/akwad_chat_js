import { Participant } from "./Participant";
import { Message } from "./Message";
import firebase = require("firebase");
import { FirebaseChatConfigs } from "../FirebaseChatConfigs";
import { SendMessageTask, _SingleUploadTask } from "../SendTask";
import { ChatAttachment } from "./ChatAttachment";
import { BehaviorSubject } from "rxjs";
export declare class Room {
    id?: string;
    name?: string;
    image?: string;
    participants?: Participant[];
    messages?: Message[];
    meta_data?: Map<String, any>;
    last_message?: Message;
    _dbr: firebase.database.Reference;
    _configs: FirebaseChatConfigs;
    _roomSubject: BehaviorSubject<Room | undefined>;
    constructor(id: string, name: string, image: string, participants: Participant[], messages: Message[], meta_data: Map<string, any>, last_message: Message);
    getRoomName: () => string;
    getRoomLink: () => string;
    getMessagesLink: () => string;
    getRoomListener(): BehaviorSubject<Room | undefined>;
    getRoom(): Promise<Room>;
    setRoomFromSnapshot(snapshot: firebase.database.DataSnapshot): Room;
    send(msg: Message): SendMessageTask;
    _createUploadAttachmentsTasks(attachments: ChatAttachment[]): Map<String, _SingleUploadTask>;
    setSeen(msg: Message, seen?: boolean): Promise<void>;
}
