import { Lobby } from "./models/Lobby";
export declare class ChatProvider {
    private _lobby;
    private _isInit;
    constructor(FirebaseConfigs: Object);
    init(onTokenExpired: () => Promise<string>): Promise<void>;
    deAuth(): void;
    getLobby(): Lobby;
}
export declare class AttachmentTypes {
    static IMAGE: string;
    static VIDEO: string;
    static AUDIO: string;
}
