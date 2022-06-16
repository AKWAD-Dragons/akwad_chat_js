import { ChatAttachment } from "./ChatAttachment";

//Message Data
export class Message {
  id?: string;
  user_id?: string;
  text?: string;
  time?: Date;
  attachments?: ChatAttachment[];

  //TODO::allow message to be initialized by text and/or attachments only without having to add undefined in constructor
  constructor(
    id?: string,
    user_id?: string,
    text?: string,
    time?: Date,
    attachments?: ChatAttachment[]
  ) {
    this.id = id;
    this.user_id = user_id;
    this.text = text;
    this.time = time;
    this.attachments = attachments;
  }
}
