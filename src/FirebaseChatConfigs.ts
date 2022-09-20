//Firebase Configs for ChatProvider
export class FirebaseChatConfigs {
  private static instance: FirebaseChatConfigs;

  private _roomsLink?: string;
  private _messagesLink?: string;
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

  getMessagesLink(): string | undefined {
    this.checkNull(this._messagesLink, "messagesLink");
    return this._messagesLink;
  }

  getUsersLink(): string | undefined {
    this.checkNull(this._usersLink, "usersLink");
    return this._usersLink;
  }

  getMyParticipantID(): string | undefined {
    this.checkNull(this._myParticipantID, "myParticipantID");
    return this._myParticipantID;
  }

  //User ID in Realtime DB
  setMyParticipantID(id: string): void {
    this._myParticipantID = id;
  }

  getMyParticipantToken(): string | undefined {
    this.checkNull(this._myParticipantToken, "myParticipantToken");
    return this._myParticipantToken;
  }


  //Example Scheme
  //firebase-project-root:
  //  Rooms:
  //    -Mw91AWdawdaWDew3
  //  Users:
  //    -Mw31sfWdafa2Dewa
  //  Messages:
  //    -RoomKey/
  //      -Message1...
  //roomsLink: link to Rooms node in realtime database
  //  for the example scheme that would be roomLink:"Rooms"
  //messagesLink: link to Messages node in realtime database
  //  for the example scheme that would be messageLink:"Messages"
  //usersLink: link to Users node in realtime database
  //  for the example scheme that would be roomLink:"Users"
  //myParticipantToken: a custom token that expires after one hour
  //  this token could be fetched through the cloud function createUser and refreshToken
  init({
    roomsLink='Rooms',
    messagesLink='Messages',
    usersLink='Users',
    myParticipantToken
  } : {
    roomsLink?: string;
    messagesLink?: string;
    usersLink?: string;
    myParticipantToken?: string;
  }): void {
    this._isInit = true;
    this._roomsLink = roomsLink ?? this._roomsLink;
    this._messagesLink = messagesLink ?? this._messagesLink;
    this._usersLink = usersLink ?? this._usersLink;
    this._myParticipantToken =
      myParticipantToken ?? this._myParticipantToken;
  }

 checkNull(variable: any, name: string): void {
    if (variable == null) {
      throw `${name} is not set`;
    }
  }
}
