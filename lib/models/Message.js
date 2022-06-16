"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Message = /** @class */ (function () {
    function Message(id, user_id, text, time, attachments) {
        this.id = id;
        this.user_id = user_id;
        this.text = text;
        this.time = time;
        this.attachments = attachments;
    }
    return Message;
}());
exports.Message = Message;
