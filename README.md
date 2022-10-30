# Akwad chat

## Initialize Firebase

initialize firebase first as in firebase documentation.

## Set FirebaseChatConfigs

Just call `FirebaseChatConfigs.init();` and pass the required parameters or keep the default values.

These parameters are the paths for Room, Users, and Messages in your firebase realtime DB.

note that the paths used here must also be defined in firebase cloud functions.

## Start Using ChatProvider

- make a new instance of `ChatProvider` and pass the firebase config object that you used to initialize firebase as a parameter.

- call `chatProvider.init(onTokenExpired)` onTokenExpired is a call back that returns a token generated from the cloud function '/refreshToken' as a String.

## Lobby

Lobby is where the user can find, list and see his rooms last messages.

- call `chatProvider.getLobby()` will return the Lobby object.
- call `lobby.getAllRooms()` to get all lobby Rooms or `lobby.getLobbyListener().subscribe()` to listen to changes in lobby like new message in lobby rooms.
- call `lobby.getUnreadRoomsCount()` to get the number of rooms with unread messages.

## Room

Room is where you can see,send messages, and see if the message is seen.

- use `room.getRoomName()` to get registered room name or a generated one based on participants.
- use `room.getRoomListener().subscribe()` to listen to `room` updates.
- Messages:
  - use `room.getUnreadMessageCount()` to get number of unread Message.
  - use `room.getMessages()` to get room message.
  - use `room.getMessagesListener().subscribe()` to listen to room message.
  - use `room.send(new Message(null,null,"HI!"))` to send a text message with text "HI!".
  - use `room.send(new Message(null,null,null,null,[new ChatAttachment(null, file)]))` to attach any file to the message.
    - use the return value to add upload progress listener using `addOnProgressCallBack` or `addOnCompleteCallBack`
  - use `room.deleteAllMessages()` to hide all messages for this participant.
  - use `room.markAsRead()` to set the last message as seen (indicates that all the previous messages are read).
  - use `room.isSeen(Message)` to check if all room participants read the passed Message.
