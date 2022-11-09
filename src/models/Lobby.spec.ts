import { beforeAll, test, expect, describe } from "@jest/globals";
import { firebaseConfig, chatConfig } from "../test.config";
import { Lobby } from "./Lobby";
import { FirebaseChatConfigs } from "../firebase.config";
import { FirebaseApp, initializeApp } from "firebase/app";

let lobby: Lobby,
  firebaseChatConfigs: FirebaseChatConfigs,
  firebaseApp: FirebaseApp;

beforeAll(() => {
  firebaseApp = firebaseApp || initializeApp(firebaseConfig);
  firebaseChatConfigs = FirebaseChatConfigs.getInstance();
  firebaseChatConfigs.init(chatConfig);
  lobby = new Lobby(firebaseChatConfigs, firebaseApp);
});

test("constructor", () => {
  expect(lobby).toBeInstanceOf(Lobby);
  // todo: expect(lobby["_dbRef"]).toBeInstanceOf()
});

test("getLobbyRooms", () =>
  lobby.getLobbyRooms().then((rooms) => {
    expect(rooms).toEqual(1);
  }));
