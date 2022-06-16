"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//Message Data
var Message = /** @class */ (function () {
    //TODO::allow message to be initialized by text and/or attachments only without having to add undefined in constructor
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
