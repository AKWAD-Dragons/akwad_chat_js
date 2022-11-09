// todo: merge this class into ChatProvider

export interface FirebaseChatOptions {
  // link to Rooms node in realtime database
  roomsLink?: string;
  // link to Messages node in realtime database
  messagesLink?: string;
  // link to Users node in realtime database
  usersLink?: string;
  // a custom token that expires after one hour
  // this token could be fetched through the cloud function createUser and refreshToken
  myParticipantToken?: string;
  myParticipantID?: string | number;
}

//Firebase Configs for ChatProvider
export class FirebaseChatConfigs {
  private static instance: FirebaseChatConfigs;
  private _roomsLink?: string;
  private _messagesLink?: string;
  private _usersLink?: string;
  private _myParticipantID?: string | number;
  private _myParticipantToken?: string;
  private _isInit: boolean = false;

  private constructor() {}

  // singleton instance
  public static getInstance(): FirebaseChatConfigs {
    if (!FirebaseChatConfigs.instance) {
      FirebaseChatConfigs.instance = new FirebaseChatConfigs();
    }

    return FirebaseChatConfigs.instance;
  }

  init(options: FirebaseChatOptions = {}): void {
    let opts: FirebaseChatOptions = {
      roomsLink: "Rooms",
      messagesLink: "Messages",
      usersLink: "Users",
      ...options,
    };
    this._isInit = true;
    this._roomsLink = opts.roomsLink ?? this._roomsLink;
    this._messagesLink = opts.messagesLink ?? this._messagesLink;
    this._usersLink = opts.usersLink ?? this._usersLink;
    this._myParticipantID = opts.myParticipantID ?? this._myParticipantID;
    this._myParticipantToken =
      opts.myParticipantToken ?? this._myParticipantToken;
  }

  handleValue(variableName: string, value?: NonNullable<string>): string {
    if (value) {
      (this[`_${variableName}` as keyof this] as string) = value;
    }
    if (!this[`_${variableName}` as keyof this])
      throw new Error(`${variableName} is not set`);
    return this[`_${variableName}` as keyof this] as string;
  }

  isInit(): boolean {
    return this._isInit;
  }

  get roomsLink(): string {
    return this.handleValue("roomsLink");
  }

  set roomsLink(value: string) {
    this.handleValue("roomsLink", value);
  }

  get messagesLink(): string {
    return this.handleValue("messagesLink");
  }

  set messagesLink(value: string) {
    this.handleValue("messagesLink", value);
  }

  get usersLink(): string {
    return this.handleValue("usersLink");
  }

  set usersLink(value: string) {
    this.handleValue("usersLink", value);
  }

  //User ID in Realtime DB
  get myParticipantID(): string {
    return this.handleValue("myParticipantID");
  }

  set myParticipantID(value: string) {
    this.handleValue("myParticipantID", value);
  }

  get myParticipantToken(): string {
    return this.handleValue("myParticipantToken");
  }

  set myParticipantToken(value: string) {
    this.handleValue("myParticipantToken", value);
  }
}
