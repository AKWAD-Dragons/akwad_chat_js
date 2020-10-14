export class FirebaseChatConfigs {
  private static instance: FirebaseChatConfigs;

  private _roomsLink?: string;
  private _usersLink?: string;
  private _myParticipantID?: string;
  private _myParticipantToken?: string;
  private _isInit: boolean = false;

  private constructor() {}
  public static getInstance(): FirebaseChatConfigs {
    if (!FirebaseChatConfigs.instance) {
      FirebaseChatConfigs.instance = new FirebaseChatConfigs();
    }

    return FirebaseChatConfigs.instance;
  }

  isInit(): boolean {
    return this._isInit;
  }

  getRoomsLink(): string | undefined {
    this.checkNull(this._roomsLink, "roomLink");
    return this._roomsLink;
  }

  getUsersLink(): string | undefined {
    this.checkNull(this._usersLink, "usersLink");
    return this._usersLink;
  }

  getMyParticipantID(): string | undefined {
    this.checkNull(this._myParticipantID, "myParticipantID");
    return this._myParticipantID;
  }
  setMyParticipantID(id: string): void {
    this._myParticipantID = id;
  }

  getMyParticipantToken(): string | undefined {
    this.checkNull(this._myParticipantToken, "myParticipantToken");
    return this._myParticipantToken;
  }

  init(params: {
    roomsLink: string;
    usersLink: string;
    myParticipantToken: string;
  }): void {
    this._isInit = true;
    this._roomsLink = params.roomsLink ?? this._roomsLink;
    this._usersLink = params.usersLink ?? this._usersLink;
    this._myParticipantToken =
      params.myParticipantToken ?? this._myParticipantToken;
  }

  checkNull(variable: any, name: string): void {
    if (variable == null) {
      throw `${name} is not set`;
    }
  }
}
