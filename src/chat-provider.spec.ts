import { beforeAll, test, expect, describe } from "@jest/globals";
import { FirebaseApp, FirebaseOptions } from "firebase/app";
import { ChatProvider } from "./chat-provider";
import { FirebaseChatOptions } from "./firebase.config";

let chatProvider: ChatProvider,
  firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyDNHapmkBjO39XztyBqjb_0syU0pHSXd8k",
    authDomain: "learnovia-notifications.firebaseapp.com",
    databaseURL: "https://learnovia-notifications.firebaseio.com",
    projectId: "learnovia-notifications",
    storageBucket: "learnovia-notifications.appspot.com",
    messagingSenderId: "1056677579116",
    appId: "1:1056677579116:web:23adce50898d8016ec8b49",
    measurementId: "G-BECF0Q93VE",
  },
  chatConfig: FirebaseChatOptions = {
    roomsLink: "Rooms",
    usersLink: "Users",
    myParticipantID: 1,
    myParticipantToken:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTY2NzkwMDczMCwiZXhwIjoxNjY3OTA0MzMwLCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay16NGgyNEBsZWFybm92aWEtbm90aWZpY2F0aW9ucy5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInN1YiI6ImZpcmViYXNlLWFkbWluc2RrLXo0aDI0QGxlYXJub3ZpYS1ub3RpZmljYXRpb25zLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwidWlkIjoiLU1paHNibHlPd3BLQXo0aGctb0kifQ.ZY34p6-mVadb4C0CbwFxGRWvlwyRqkoxI00S_mNnlJ6BqRKZqeA-c-qBR69dXbu32UMKF-jvBcApYrBGn6nP7akeJn4xNmWnNtaRzmFYOo0zQwDPXbdw5a0on_UKop9l9atPBCkcFw3gy8GvHKx-22v1nH7WDe9YriJ--u7SkFcPWMw7TACI4yP8jBosf-MdBbshtF65h3wY8zJfur55Sh6KMsa1Oi3swKc8BqutBfQwYpuCorB2AhSPSUV8P1TVjfM_AUSYOxJ71n2mBVUOdp4CVshyfSejwy3mvltXdVa4owhmADwGv8nn06-lYnUbCEOH2xMJCT0ihfSOtj0L4g",
  },
  firebaseApp: FirebaseApp;

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
        expect(value).toEqual(1);
      })
      .catch((error__) => console.error({ error__ })));
});
