import { beforeAll, test, expect } from "@jest/globals";
import { FirebaseChatConfigs } from "./firebase.config";
import { firebaseConfig, chatConfig } from "./test.config";

let firebaseChatConfig: FirebaseChatConfigs;

beforeAll(() => {
  firebaseChatConfig = FirebaseChatConfigs.getInstance();
  firebaseChatConfig.init(chatConfig);
});

test("init", () => {
  expect(firebaseChatConfig.roomsLink).toEqual(chatConfig.roomsLink);
  expect(firebaseChatConfig.isInit()).toBeTruthy();
});

test("getInstance", () => {
  expect(FirebaseChatConfigs.getInstance()).toBeInstanceOf(FirebaseChatConfigs);
});

test("handleValue", () => {
  expect(firebaseChatConfig.handleValue("roomsLink")).toEqual(
    chatConfig.roomsLink
  );
});

test("handleValue: set", () => {
  // set a value
  expect(firebaseChatConfig.handleValue("roomsLink", "Rooms2")).toEqual(
    "Rooms2"
  );

  // get a private property's value
  expect(firebaseChatConfig.handleValue("roomsLink")).toEqual("Rooms2");
});
