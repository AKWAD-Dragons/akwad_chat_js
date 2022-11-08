//TODO::Copy variables, functions, classes privacy(private or public) from the Dart SDK
import { FirebaseChatConfigs, FirebaseChatOptions } from "./firebase.config";
import { Lobby } from "./models/Lobby";
import { FirebaseApp, FirebaseOptions, initializeApp } from "firebase/app";
import {
  Auth,
  getAuth,
  signInWithCustomToken,
  signOut,
  UserCredential,
} from "firebase/auth";

/*
  ***Starting Point***
  1-Before you call ChatProvider() you will first need to call
    *FirebaseChatConfigs.instance.init()

  2-call chatProvider.init(onTokenExpired)

  3-call chatProvider.getLobby() to start using the current user lobby

*/
export class ChatProvider {
  private _lobby: Lobby;
  private _isInit = false;
  private firebaseChatConfigs: FirebaseChatConfigs =
    FirebaseChatConfigs.getInstance();
  private auth: Auth;

  constructor(
    firebaseConfigs: FirebaseOptions,
    chatConfig: FirebaseChatOptions,
    private firebaseApp?: FirebaseApp
  ) {
    if (!firebaseConfigs || !chatConfig) {
      throw new Error(`provide both firebaseConfigs and chatConfig`);
    }
    this.firebaseApp = this.firebaseApp || initializeApp(firebaseConfigs);
    this.firebaseChatConfigs.init(chatConfig);

    // this._lobby = new Lobby();
  }

  /**
   * initialize the chat and authenticate the user
   * @param onTokenExpired a function to refresh the token when it expires
   * @returns
   */
  // todo: return lobby
  async init(
    onTokenExpired: () => string | Promise<string>
  ): Promise<UserCredential | void> {
    this.auth = getAuth();
    let user = this.auth.currentUser;

    if (user) {
      this.firebaseChatConfigs.myParticipantID = user.uid;
      this._isInit = true;

      // todo: return UserCredential or User
      return;
    }

    return signInWithCustomToken(
      this.auth,
      this.firebaseChatConfigs.myParticipantToken
    ).catch(() => {
      let token = onTokenExpired();
      return (token instanceof Promise ? token : Promise.resolve(token)).then(
        (token) => {
          this.firebaseChatConfigs.init({ myParticipantToken: token });
          this._isInit = true;
          return signInWithCustomToken(this.auth, token ?? "");
        }
      );
    });
  }

  logout() {
    signOut(this.auth);
  }

  //Returns lobby if it's safe to use lobby
  getLobby(): Lobby {
    if (!this._isInit) {
      throw "must call init";
    }
    return this._lobby;
  }
}

export class AttachmentTypes {
  static IMAGE: string = "image";
  static VIDEO: string = "video";
  static AUDIO: string = "audio";
}
