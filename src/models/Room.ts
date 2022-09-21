import { Participant } from "./Participant";
import { Message } from "./Message";
import firebase = require("firebase");
import { database } from "firebase";
import { FirebaseChatConfigs } from "../FirebaseChatConfigs";
import { SendMessageTask, _SingleUploadTask } from "../SendTask";
import { ChatAttachment } from "./ChatAttachment";
import { BehaviorSubject, Subscribable } from "rxjs";
import { plainToClass } from "class-transformer";

export class Room {
	id?: string;
	name?: string;
	image?: string;
	participants?: Participant[];
	messages?: Message[];
	meta_data?: Map<String, any>;
	last_message?: Message;
	last_message_index?: number;

	_dbr: firebase.database.Reference = firebase.database().ref();

	_configs: FirebaseChatConfigs = FirebaseChatConfigs.getInstance();

 	userRoomData?: Map<String, any>;
	_ignoredFirstMessagesOnValue:boolean = false;


	_roomSubject: BehaviorSubject<Room | undefined> = new BehaviorSubject<
		Room | undefined
	>(undefined);
	
	_messagesSubject: BehaviorSubject<Message | undefined> = new BehaviorSubject<
		Message | undefined
	>(undefined);

	constructor(
		id: string,
		name: string,
		image: string,
		participants: Participant[],
		messages: Message[],
		meta_data: Map<string, any>,
		last_message: Message
	) {
		this.id = id;
		this.name = name;
		this.image = image;
		this.participants = participants;
		this.messages = messages;
		this.meta_data = meta_data;
		this.last_message = last_message;
	}

	//gets room name if it's not null
	//if null it concatenate participants names using a comma
	getRoomName = (): string => {
		if (!this.participants) return "";
		if (this.name) {
			return this.name;
		}
		let makeName = "";
		let length = this.participants.length > 4 ? 4 : this.participants.length;
		let endText = this.participants.length > 4 ? ", ..." : "";
		for (let i = 0; i < length; i++) {
			if (
				this.participants[i].id ==
				FirebaseChatConfigs.getInstance().getMyParticipantID()
			) {
				continue;
			}
			makeName += this.participants[i].name;
			if (i < this.participants.length - 1) {
				makeName += ", ";
			}
		}
		return makeName + endText;
	};

	//current room link in RTDB
	getRoomLink = () => this._configs.getRoomsLink() + `/${this.id}`;

	//current room messages link in RTDB
	getMessagesLink = () => this._configs.getMessagesLink + "/$id";

	async getRoomListener() {
    await this._setUserRoomData();
		this._dbr.child(this.getRoomLink()).off();
    this._dbr.child(this.getRoomLink()).on('value', (snapshot: database.DataSnapshot)=>{
			let room = this.parseRoomFromSnapshotValue(snapshot?.val() ?? null);
      this._setThisFromRoom(room);
		});
		return this._roomSubject;
  }

  //get room data without listening
	async getRoom():Promise<Room> {
    let snapshot: database.DataSnapshot  = await this._dbr.child(this.getRoomLink()).once('value');
    await this._setUserRoomData();
    let room  = this.parseRoomFromSnapshotValue(snapshot?.val() ?? null);
    this._setThisFromRoom(room);
    return this;
  }

  //get unread messages count
  getUnreadMessagesCount () : number {
    let myParticipant = this.participants?.find(
        (p) => p.id == FirebaseChatConfigs.getInstance().getMyParticipantID());
    if (myParticipant == null) {
      return 0;
    }
    return (this.last_message_index ?? 0) - (myParticipant.last_seen_message_index ?? 0);
  }

	async _setUserRoomData(force:boolean = false) : Promise<void> {
    if (this.userRoomData != null && !force) return;
     let snapshot = await this._dbr
        .child(this._configs.getUsersLink() + "/" + this._configs.getMyParticipantID() + "/rooms")
        .child(this.id??'')
        .child('/data')
        .once('value');
    this.userRoomData = snapshot?.val();
  }

  //copies room object data into current room
  _setThisFromRoom(room:Room) {
    this.meta_data = room.meta_data;
    this.participants = room.participants;
    this.image = room.image;
    this.name = room.name;
    this.last_message = room.last_message;
    this.last_message_index = room.last_message_index;
  }

   async getMessages() : Promise<Message[]> {
    await this._setUserRoomData();
    let snapshot = await this._dbr.child(this.getMessagesLink()).once('value');
    let messages = this._parseMessagesFromSnapshotValue(snapshot.value);
    return messages;
  }

  //get messages listener
  async getMessagesListener(): Promise<Subscribable<Message | undefined>> {
    await this._setUserRoomData();
		this._dbr.child(this.getMessagesLink()).on('value',(snapshot: database.DataSnapshot)=>{
			if (!this._ignoredFirstMessagesOnValue) {
        this._ignoredFirstMessagesOnValue = true;
        continue;
      }
      let messages =
          this._parseMessagesFromSnapshotValue(snapshot?.value ?? null);
      this.last_message = messages.last;
		});
		return this._messagesSubject;
  }

  //TODO::make Lobby use this to parse each single room
  //parse room using snapshot value
  Room parseRoomFromSnapshotValue(dynamic snapshotValue) {
    if (snapshotValue == null) return null;
    LinkedHashMap<String, dynamic> roomJson =
        LinkedHashMap<String, dynamic>.from(snapshotValue);
    if (roomJson.containsKey("meta_data")) {
      roomJson['meta_data'] =
          LinkedHashMap<String, dynamic>.from(roomJson["meta_data"]);
    }
    if (roomJson.containsKey("participants")) {
      roomJson['participants'] = roomJson["participants"].keys.map((key) {
        LinkedHashMap<String, dynamic> map =
            LinkedHashMap<String, dynamic>.from(roomJson["participants"][key]);
        map["id"] = key;
        return map;
      }).toList();
    }
    if (roomJson.containsKey("last_message")) {
      var messageMap =
          LinkedHashMap<String, dynamic>.from(roomJson["last_message"]);
      if (messageMap.containsKey("attachments")) {
        messageMap['attachments'] = _buildMessageAttachmentJson(messageMap);
      }
      roomJson["last_message"] = messageMap;
    }
    Room room = Room.fromJson(roomJson);
    return room;
  }

  List<Message> _parseMessagesFromSnapshotValue(dynamic snapShotValue) {
    if (snapShotValue == null) {
      return [];
    }
    String deletedTo;
    if (userRoomData.containsKey("deleted_to")) {
      deletedTo = userRoomData["deleted_to"];
    }
    List<Message> messageList = [];
    for (String key in snapShotValue.keys) {
      if (deletedTo != null && key.compareTo(deletedTo) <= 0) {
        continue;
      }
      if (snapShotValue[key].containsKey("attachments")) {
        snapShotValue[key]['attachments'] =
            _buildMessageAttachmentJson(snapShotValue[key]);
      }
      snapShotValue[key]['id'] = key;
      Message message = _parseMessageFromSnapshotValue(snapShotValue[key]);
      messageList.add(message);
    }
    //sort messages by id
    messageList.sort((a, b) => a.id.compareTo(b.id));
    return messageList;
  }

  Message _parseMessageFromSnapshotValue(dynamic snapShotValue) {
    if (snapShotValue == null) return null;
    if (snapShotValue.containsKey("attachments")) {
      snapShotValue['attachments'] = _buildMessageAttachmentJson(snapShotValue);
    }
    Message message =
        Message.fromJson(LinkedHashMap<String, dynamic>.from(snapShotValue));
    return message;
  }

  List<LinkedHashMap<String, dynamic>> _buildMessageAttachmentJson(
      dynamic messageMap) {
    return List<LinkedHashMap<String, dynamic>>.from(messageMap["attachments"]
        .map((value) => LinkedHashMap<String, dynamic>.from(value))
        .toList());
  }

  //TODO::Allow user to mute a selected room
  Stream<List<Message>> mute() {}

  //Sends a message that may contains text and/or attachments
  //Returns a SendMessageTask that could be used to track attachments upload progress
  SendMessageTask send(Message msg) {
    if (msg.attachments?.isNotEmpty ?? false) {
      SendMessageTask sendMessageTask =
          SendMessageTask._(_createUploadAttachmentsTasks(msg.attachments));
      sendMessageTask
          .addOnCompleteListener((List<ChatAttachment> uploadedAttachments) {
        msg.attachments = uploadedAttachments;
        _dbr.child("buffer/$id").push().set(msg.toJson());
      });
      sendMessageTask.startAllTasks();
      return sendMessageTask;
    }
    _dbr.child("buffer/$id").push().set(msg.toJson());
    return SendMessageTask._({"send_task": _SingleUploadTask._(null, null)});
  }
  //assign each attachment to a SingleUploadTask
  //returns a map of {attachment_key:_SingleUploadTask}
  Map<String, _SingleUploadTask> _createUploadAttachmentsTasks(
      List<ChatAttachment> attachments) {
    Map<String, _SingleUploadTask> uploadTasks = {};
    attachments.forEach((ChatAttachment attachment) {
      String path = "$id/${DateTime.now().millisecondsSinceEpoch}";
      _SingleUploadTask singleTask = _SingleUploadTask._(attachment, path);
      //gives current timestamp as a key if no key passed to attachment
      uploadTasks[attachment.key ?? DateTime.now().millisecondsSinceEpoch] =
          singleTask;
    });
    return uploadTasks;
  }

  bool deleteAllMessages() {
    if (lastMessage == null) return false;
    _dbr
        .child(_configs.usersLink + "/" + _configs.myParticipantID + "/rooms")
        .child(id)
        .child('/data')
        .update({'deleted_to': lastMessage.id}).then(
            (value) => _setUserRoomData(true));
    return true;
  }

  //TODO::[OPTIMIZATION]check if room last seen is the same as the package and ignore sending seen again
  //sets message as seen
  Future<void> markAsRead() async {
    if (lastMessage == null ||
        lastMessage.id == null ||
        lastMessageIndex == null) {
      return;
    }
    await _dbr
        .child(roomLink + "/participants/${_configs.myParticipantID}")
        .update({
      'last_seen_message': lastMessage.id,
      'last_seen_message_index': lastMessageIndex
    });
    await _dbr
        .child(
            _configs.usersLink + "/${_configs.myParticipantID}/rooms/$id/data")
        .update({
      'last_seen_message': lastMessage.id,
      'last_seen_message_index': lastMessageIndex
    });
    _setUserRoomData(true);
  }

  //gets room participants and check last seen message of each participant
  //message is not seen if other participants lastSeenMessage is null or less than message id (using String compare)
  // throws Exception if msg is null
  bool isSeen(Message msg) {
    if (msg == null) {
      throw Exception("Message is null");
    }
    bool isSeen = true;
    for (Participant participant in participants) {
      if (participant.id == msg.user_id) continue;
      if (participant.lastSeenMessage == null) {
        isSeen = false;
        break;
      }
      if ((participant.lastSeenMessage).compareTo(msg.id) < 0) {
        isSeen = false;
        break;
      }
    }
    return isSeen;
  }
}