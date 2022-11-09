// you need to provide a fresh chatConfig.myParticipantToken before running tests
// login and make an http request to /api/user and get response.chat_token

import { FirebaseOptions } from "firebase/app";
import { FirebaseChatConfigs, FirebaseChatOptions } from "./firebase.config";

export let firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDNHapmkBjO39XztyBqjb_0syU0pHSXd8k",
  authDomain: "learnovia-notifications.firebaseapp.com",
  databaseURL: "https://learnovia-notifications.firebaseio.com",
  projectId: "learnovia-notifications",
  storageBucket: "learnovia-notifications.appspot.com",
  messagingSenderId: "1056677579116",
  appId: "1:1056677579116:web:23adce50898d8016ec8b49",
  measurementId: "G-BECF0Q93VE",
};

export let chatConfig: FirebaseChatOptions = {
  roomsLink: "rooms",
  usersLink: "users",
  myParticipantID: "1",
  myParticipantToken:
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTY2ODAxMTIxMSwiZXhwIjoxNjY4MDE0ODExLCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay16NGgyNEBsZWFybm92aWEtbm90aWZpY2F0aW9ucy5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInN1YiI6ImZpcmViYXNlLWFkbWluc2RrLXo0aDI0QGxlYXJub3ZpYS1ub3RpZmljYXRpb25zLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwidWlkIjoiLU1paHNibHlPd3BLQXo0aGctb0kifQ.GYfNWh-qx8PK_nuPCEcSjT04pFX4dLKAMmxh0ZGtiYtlRyNo9he5rWwEF7Ne85dRb2l-E1ns7CwDddeYl9uiyzyziDgF7RLDyF194cJQ0n5mcX275vCT85AUHguDEyaolI8uhd0hYqxqAJm2RmyzAYiDFaRdY4z6lMDT1bcZJ-95HeEC1gR23-ayKbfeWB7_hWRsbVHEtFPfMKeFKXw_2OQ0nWvDAtF6PfdCKkGYjfFxRW8Zo6C-WuxbVrlIC--w-dKkR0jcVM3NuXJKwPYqGT_XEXMKbq6DqcNO83XKmW4h1hPDYeep9kG847D8BfDR2vHieT6N7wE4qto_T6mEuw",
};
