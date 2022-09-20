import { Participant } from "./Participant";
import { Message } from "./Message";
import firebase = require("firebase");
import { FirebaseChatConfigs } from "../FirebaseChatConfigs";
import { SendMessageTask, _SingleUploadTask } from "../SendTask";
import { ChatAttachment } from "./ChatAttachment";
import { BehaviorSubject } from "rxjs";
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

 	userRoomDate?: Map<String, any>;
	_ignoredFirstMessagesOnValue:boolean = false;


	_roomSubject: BehaviorSubject<Room | undefined> = new BehaviorSubject<
		Room | undefined
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

	//listen to Room updates
	getRoomListener(): BehaviorSubject<Room | undefined> {
		this._dbr.child(this.getRoomLink()).on("value", (snapshot) => {
			this.setThisFromRoom(Room.getRoomFromSnapshot(snapshot.val()));
			this._roomSubject.next(this);
		});
		return this._roomSubject;
	}

	//get room data without listening
	async getRoom(): Promise<Room> {
		let snapshot = await this._dbr.child(this.getRoomLink()).once("value");
		this.setThisFromRoom(Room.getRoomFromSnapshot(snapshot.val()));
		return this;
	}

	//copies room object data into current room
	setThisFromRoom(room: Room) {
		this.meta_data = room.meta_data;
		this.participants = room.participants;
		this.image = room.image;
		this.name = room.name;
		this.messages = room.messages;
		this.last_message = undefined;
	}

	//parse room using snapshot value
	public static getRoomFromSnapshot(roomObj: any): Room {
		let room = plainToClass(Room, roomObj) as unknown as Room;
		let msgs: Message[] = new Array<Message>();
		let participants: Participant[] = new Array<Participant>();
		if (roomObj["messages"] != null) {
			let messageObj = roomObj["messages"];
			for (let property in messageObj) {
				let msg = messageObj[property] as Message;
				msg.id = property;
				msgs.push(msg);
			}
		}
		if (roomObj["participants"] != null) {
			let participantsObj = roomObj["participants"];
			for (let property in participantsObj) {
				let participant = participantsObj[property] as Participant;
				participant.id = property;
				participants.push(participant);
			}
		}
		msgs = plainToClass(Message, msgs);
		room.messages = msgs;
		room.participants = participants;
		return room;
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

	isLastMessageRead = (): boolean => {
		//get participant where participant id is this._configs.getMyParticipantID()
		let participant: Participant | undefined = this.participants?.find(
			(participant) => participant.id === this._configs.getMyParticipantID()
		);
		if (!participant) {
			return false;
		}

		//get last message
		let lastMessage: Message | undefined =
			this.messages![this.messages!.length - 1];
		if (!lastMessage) {
			return false;
		}
		return participant.last_seen_message === lastMessage.id || lastMessage.user_id === this._configs.getMyParticipantID();
	};

	//TODO::[OPTIMIZATION]check if room last seen is the same as the package and ignore sending seen again
	//sets message as seen
	async setSeen(msg: Message, seen = true): Promise<void> {
		if (!msg) {
			return;
		}
		await this._dbr
			.child(
				this.getRoomLink() +
					`/participants/${this._configs.getMyParticipantID()}`
			)
			.update({ last_seen_message: msg.id });
	}
}
