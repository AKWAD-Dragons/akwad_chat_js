import { Participant } from "./Participant";
import { Message } from "./Message";
import firebase from "firebase";
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

  _dbr: firebase.database.Reference = firebase.database().ref();

  _configs: FirebaseChatConfigs = FirebaseChatConfigs.getInstance();

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

  getRoomName = (): string => {
    if (!this.participants) return "";
    if (this.name != null) {
      return this.name;
    }
    let makeName = "";
    let length = this.participants.length > 3 ? 3 : this.participants.length;
    let endText = this.participants.length > 3 ? ", ..." : "";
    for (let i = 0; i < length; i++) {
      makeName += this.participants[i].name;
      if (i < this.participants.length - 1) {
        makeName += ", ";
      }
    }
    return makeName + endText;
  };

  getRoomLink = () => this._configs.getRoomsLink() + `/${this.id}`;

  getMessagesLink = () => this._configs.getRoomsLink() + `/${this.id}/messages`;

  getRoomListener(): BehaviorSubject<Room | undefined> {
    this._dbr.child(this.getRoomLink()).on("value", (snapshot) => {
      this.setRoomFromSnapshot(snapshot);
      this._roomSubject.next(this);
    });
    return this._roomSubject;
  }

  async getRoom(): Promise<Room> {
    let snapshot = await this._dbr.child(this.getRoomLink()).once("value");
    this.setRoomFromSnapshot(snapshot);
    return this;
  }

  setRoomFromSnapshot(snapshot: firebase.database.DataSnapshot): Room {
    let room = (plainToClass(Room, snapshot.val()) as unknown) as Room;
    let msgs: Message[] = new Array<Message>();
    if (snapshot.val()["messages"] != null) {
      let messageObj = snapshot.val()["messages"];
      for (let property in messageObj) {
        let msg = messageObj[property] as Message;
        msg.id = property;
        msgs.push(msg);
      }
    }
    msgs = plainToClass(Message, msgs);
    room.messages = msgs;
    this.meta_data = room.meta_data;
    this.participants = room.participants;
    this.image = room.image;
    this.name = room.name;
    this.messages = room.messages;
    this.last_message = undefined;
    return this;
  }

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

  _createUploadAttachmentsTasks(
    attachments: ChatAttachment[]
  ): Map<String, _SingleUploadTask> {
    let uploadTasks = new Map<String, _SingleUploadTask>();
    attachments.forEach((attachment: ChatAttachment) => {
      let path = `${this.id}/${Date.now()}`;
      let singleTask = new _SingleUploadTask(attachment, path);

      uploadTasks.set(attachment.key ?? Date.now(), singleTask);
    });
    return uploadTasks;
  }

  async setSeen(msg: Message, seen = true): Promise<void> {
    if(!msg){
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
