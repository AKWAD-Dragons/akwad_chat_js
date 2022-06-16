"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChatAttachment = /** @class */ (function () {
    function ChatAttachment(key, type, file, file_link) {
        this.key = key;
        this.file = file;
        this.type = type;
        this.fileLink = file_link;
    }
    return ChatAttachment;
}());
exports.ChatAttachment = ChatAttachment;
