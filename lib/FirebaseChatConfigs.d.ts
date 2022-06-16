export declare class FirebaseChatConfigs {
    private static instance;
    private _roomsLink?;
    private _usersLink?;
    private _myParticipantID?;
    private _myParticipantToken?;
    private _isInit;
    private constructor();
    static getInstance(): FirebaseChatConfigs;
    isInit(): boolean;
    getRoomsLink(): string | undefined;
    getUsersLink(): string | undefined;
    getMyParticipantID(): string | undefined;
    setMyParticipantID(id: string): void;
    getMyParticipantToken(): string | undefined;
    init(params: {
        roomsLink: string;
        usersLink: string;
        myParticipantToken: string;
    }): void;
    checkNull(variable: any, name: string): void;
}
