import { Participant } from "./Participant";
import { Message } from "./Message";
import firebase from "firebase";
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
	getMessagesLink = () => this._configs.getMessagesLink() + `/${this.id}`;

	async getRoomListener() {
    await this._setUserRoomData();
		this._dbr.child(this.getRoomLink()).off();
    this._dbr.child(this.getRoomLink()).on('value', (snapshot: firebase.database.DataSnapshot)=>{
			let room = this.parseRoomFromSnapshotValue(snapshot?.val() ?? null);
      this._setThisFromRoom(room);
		});
		return this._roomSubject;
  }

  //get room data without listening
	async getRoom():Promise<Room> {
    let snapshot: firebase.database.DataSnapshot  = await this._dbr.child(this.getRoomLink()).once('value');
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
  _setThisFromRoom(room:Room|null) {
    this.meta_data = room?.meta_data;
    this.participants = room?.participants;
    this.image = room?.image;
    this.name = room?.name;
    this.last_message = room?.last_message;
    this.last_message_index = room?.last_message_index;
  }

   async getMessages() : Promise<Message[]> {
    await this._setUserRoomData();
    console.log(this.getMessagesLink());
    let snapshot = await this._dbr.child(this.getMessagesLink()).once('value');
    let messages = this._parseMessagesFromSnapshotValue(snapshot.val());
    return messages;
  }

  //get messages listener
  async getMessagesListener(): Promise<Subscribable<Message | undefined>> {
    await this._setUserRoomData();
		this._dbr.child(this.getMessagesLink()).on('value',(snapshot: firebase.database.DataSnapshot)=>{
			if (!this._ignoredFirstMessagesOnValue) {
        this._ignoredFirstMessagesOnValue = true;
        return;
      }
      let messages =
          this._parseMessagesFromSnapshotValue(snapshot?.val() ?? null);
      this.last_message = messages[messages.length-1];
		});
		return this._messagesSubject;
  }

  //TODO::make Lobby use this to parse each single room
  //parse room using snapshot value
  parseRoomFromSnapshotValue(roomJson: Map<String, any> | null): Room | null {
    if (roomJson == null) return null;
    if (roomJson.has("participants")) {
      roomJson.get("participants")
      roomJson.get("participants").keys.map((key:string) => {
        let map: Map<String, any> = roomJson.get("participants").get(key);
        map.set("id", key);
        return map;
      }).toList();
    }
    let room = roomJson as unknown as Room;
    return room;
  }

  _parseMessagesFromSnapshotValue(snapShotValue: Map<String,any>): Message[] {
    if (snapShotValue == null) {
      return [];
    }
    let deletedTo;
    if (this.userRoomData?.has("deleted_to")??false) {
      deletedTo = this.userRoomData?.get("deleted_to");
    }
    let messageList = new Array<Message>();
    for (let key of Array.from(snapShotValue.keys())) {
      if (deletedTo != null && key < deletedTo) {
        continue;
      }
      snapShotValue.get(key).set('id', key);
      let message:Message = snapShotValue.get(key) as Message
      messageList.push(message);
    }
    //sort messages by id
    messageList.sort((a, b) => (a > b ? -1 : 1));
    return messageList;
  }

  //Sends a message that may contains text and/or attachments
	//Returns a SendMessageTask that could be used to track attachments upload progress
	send(msg: Message): SendMessageTask {
		if (msg.attachments?.length ?? 0 > 0) {
			if (msg.attachments != undefined) {
				let sendMessageTask = new SendMessageTask(
					this._createUploadAttachmentsTasks(msg.attachments)
				);
				sendMessageTask.addOnCompleteListener(
					(uploadedAttachments: ChatAttachment[]) => {
						console.log(uploadedAttachments);
						msg.attachments = uploadedAttachments;
						this._dbr
							.child(`buffer/${this.id}`)
							.push()
							.set(JSON.parse(JSON.stringify(msg)));
					}
				);
				sendMessageTask.startAllTasks();
				return sendMessageTask;
			}
		}

		this._dbr
			.child(`buffer/${this.id}`)
			.push()
			.set(JSON.parse(JSON.stringify(msg)));
		let x = new Map<String, _SingleUploadTask>();
		x.set("send_task", new _SingleUploadTask(undefined, undefined));
		return new SendMessageTask(x);
	}

	//assign each attachment to a SingleUploadTask
	//returns a map of {attachment_key:_SingleUploadTask}
	_createUploadAttachmentsTasks(
		attachments: ChatAttachment[]
	): Map<String, _SingleUploadTask> {
		let uploadTasks = new Map<String, _SingleUploadTask>();
		attachments.forEach((attachment: ChatAttachment) => {
			let path = `${this.id}/${Date.now()}`;
			let singleTask = new _SingleUploadTask(attachment, path);

			//gives current timestamp as a key if no key passed to attachment
			uploadTasks.set(attachment.key ?? Date.now(), singleTask);
		});
		return uploadTasks;
	}

  deleteAllMessages(): boolean {
    if (this.last_message == null) return false;
    this._dbr
        .child(this._configs.getUsersLink() + "/" + this._configs.getMyParticipantID() + "/rooms")
        .child(this.id??"")
        .child('/data')
        .update({'deleted_to': this.last_message.id}).then(
            (value) => this._setUserRoomData(true));
    return true;
  }

  //TODO::[OPTIMIZATION]check if room last seen is the same as the package and ignore sending seen again
  //sets message as seen
  async markAsRead(): Promise<void>  {
    if (this.last_message == null ||
        this.last_message.id == null ||
        this.last_message_index == null) {
      return;
    }
    await this._dbr
        .child(this.getRoomLink() + "/participants/${_configs.myParticipantID}")
        .update({
      'last_seen_message': this.last_message.id,
      'last_seen_message_index': this.last_message_index
    });
    await this._dbr
        .child(
            this._configs.getUsersLink() + "/${_configs.myParticipantID}/rooms/$id/data")
        .update({
      'last_seen_message': this.last_message.id,
      'last_seen_message_index': this.last_message_index
    });
    this._setUserRoomData(true);
  }

  //gets room participants and check last seen message of each participant
  //message is not seen if other participants lastSeenMessage is null or less than message id (using String compare)
  // throws Exception if msg is null
  isSeen(msg:Message):boolean {
    if (msg == null) {
      throw "Message is null";
    }
    let isSeen: boolean = true;
    if(this.participants==null){
      return false;
    }
    for (let participant of this.participants) {
      if (participant?.id == msg.user_id) continue;
      if (participant.last_seen_message == null) {
        isSeen = false;
        break;
      }
      if (participant.last_seen_message < (msg?.id??"")) {
        isSeen = false;
        break;
      }
    }
    return isSeen;
  }
}