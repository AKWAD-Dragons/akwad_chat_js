export class ChatAttachment {
  key: string;
  file?: File;
  type: string;
  fileLink?: string;
  constructor(key: string, type: string, file?: File, file_link?: string) {
    this.key = key;
    this.file = file;
    this.type = type;
    this.fileLink = file_link;
  }
}
