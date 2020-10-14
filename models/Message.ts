import { ChatAttachment } from "./ChatAttachment";

export class Message {
  id?: string;
  user_id?: string;
  text?: string;
  time?: Date;
  attachments?: ChatAttachment[];

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
