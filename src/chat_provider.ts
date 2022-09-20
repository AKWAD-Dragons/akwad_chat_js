//TODO::Copy variables, functions, classes privacy(private or public) from the Dart SDK
import { FirebaseChatConfigs } from "./FirebaseChatConfigs";
import { Lobby } from "./models/Lobby";
import firebase = require("firebase");

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

	constructor(FirebaseConfigs: Object) {
		firebase.initializeApp(FirebaseConfigs);
		if (!FirebaseChatConfigs.getInstance().isInit()) {
			throw "call FirebaseChatConfigs.instance.init() first";
		}
		this._lobby = new Lobby();
	}

	/*
   *this function must be called to initialize the Chat User and authenticate him

   *Params:
      onTokenExpired()=>String: a callback function that gets called
        if the token passed is expired
        could be used to refresh token passed to FirebaseChatConfigs.init
   */
	async init(onTokenExpired: () => Promise<string>): Promise<void> {
		let user = firebase.auth().currentUser;
		if (user) {
			FirebaseChatConfigs.getInstance().setMyParticipantID(user.uid);
			this._isInit = true;
			return;
		}
		let creds = await firebase
			.auth()
			.signInWithCustomToken(
				FirebaseChatConfigs.getInstance().getMyParticipantToken() || ""
			)
			.catch(async (ex) => {
				console.log(
					"Token is invalid or expired\nretrying with onTokenExpired"
				);
				FirebaseChatConfigs.getInstance().init({
					myParticipantToken: await onTokenExpired(),
				});
				await firebase
					.auth()
					.signInWithCustomToken(
						FirebaseChatConfigs.getInstance().getMyParticipantToken() ?? ""
					)
					.then((value) => {
              FirebaseChatConfigs.getInstance().setMyParticipantID(value.user?.uid??"");
          })
					.catch((e) => {
						throw e;
					});
				return;
			});

		this._isInit = true;
	}

	deAuth() {
		firebase.auth().signOut();
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
