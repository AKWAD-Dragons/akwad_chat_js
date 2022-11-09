import { beforeAll, test, expect, describe } from "@jest/globals";
import { FirebaseApp, FirebaseOptions } from "firebase/app";
import { AuthCredential, UserCredential } from "firebase/auth";
import { ChatProvider } from "./chat-provider";
import { firebaseConfig, chatConfig } from "./test.config";

let chatProvider: ChatProvider, firebaseApp: FirebaseApp;

beforeAll(() => {
  chatProvider = new ChatProvider(firebaseConfig, chatConfig);
});

describe("chat provider", () => {
  test("init", () =>
    chatProvider
      // todo: get a fresh token from the backend,
      // make an http request to `user/$id`
      .init(() => chatConfig.myParticipantToken!)
      .then((value) => {
        // todo: expect(value).toBeInstanceOf(UserCredential);
        expect(value).toBeTruthy();
      }));
});
