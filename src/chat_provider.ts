import { FirebaseChatConfigs } from "./FirebaseChatConfigs";
import { Lobby } from "./models/Lobby";
import firebase  = require("firebase");

export class ChatProvider {
  private _lobby: Lobby;

  constructor() {
    if (!FirebaseChatConfigs.getInstance().isInit()) {
      throw "call FirebaseChatConfigs.instance.init() first";
    }
    this._lobby = new Lobby();
  }

  async getLobby(): Promise<Lobby> {
    let user = firebase.auth().currentUser;
    if (user) {
      FirebaseChatConfigs.getInstance().setMyParticipantID(user.uid);
      return this._lobby;
    }
    console.log(
      FirebaseChatConfigs.getInstance().getMyParticipantToken() || ""
    );
    let creds = await firebase
      .auth()
      .signInWithCustomToken(
        FirebaseChatConfigs.getInstance().getMyParticipantToken() || ""
      );

    console.log(creds.user);
    if (creds && creds.user) {
      FirebaseChatConfigs.getInstance().setMyParticipantID(creds.user.uid);
    }
    return this._lobby;
  }
}

export class AttachmentTypes {
  static IMAGE: string = "image";
  static VIDEO: string = "video";
  static AUDIO: string = "audio";
}
