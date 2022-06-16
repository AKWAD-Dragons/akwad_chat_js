import { Lobby } from "./models/Lobby";
export declare class ChatProvider {
    private _lobby;
    constructor();
    getLobby(): Promise<Lobby>;
}
export declare class AttachmentTypes {
    static IMAGE: string;
    static VIDEO: string;
    static AUDIO: string;
}
