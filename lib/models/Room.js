"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Message_1 = require("./Message");
var firebase = require("firebase");
var FirebaseChatConfigs_1 = require("../FirebaseChatConfigs");
var SendTask_1 = require("../SendTask");
var rxjs_1 = require("rxjs");
var class_transformer_1 = require("class-transformer");
var Room = /** @class */ (function () {
    function Room(id, name, image, participants, messages, meta_data, last_message) {
        var _this = this;
        this._dbr = firebase.database().ref();
        this._configs = FirebaseChatConfigs_1.FirebaseChatConfigs.getInstance();
        this._roomSubject = new rxjs_1.BehaviorSubject(undefined);
        //gets room name if it's not null
        //if null it concatenate participants names using a comma
        this.getRoomName = function () {
            if (!_this.participants)
                return "";
            if (_this.name) {
                return _this.name;
            }
            var makeName = "";
            var length = _this.participants.length > 4 ? 4 : _this.participants.length;
            var endText = _this.participants.length > 4 ? ", ..." : "";
            for (var i = 0; i < length; i++) {
                if (_this.participants[i].id ==
                    FirebaseChatConfigs_1.FirebaseChatConfigs.getInstance().getMyParticipantID()) {
                    continue;
                }
                makeName += _this.participants[i].name;
                if (i < _this.participants.length - 1) {
                    makeName += ", ";
                }
            }
            return makeName + endText;
        };
        //current room link in RTDB
        this.getRoomLink = function () { return _this._configs.getRoomsLink() + ("/" + _this.id); };
        //current room messages link in RTDB
        this.getMessagesLink = function () { return _this._configs.getRoomsLink() + ("/" + _this.id + "/messages"); };
        this.id = id;
        this.name = name;
        this.image = image;
        this.participants = participants;
        this.messages = messages;
        this.meta_data = meta_data;
        this.last_message = last_message;
    }
    //listen to Room updates
    Room.prototype.getRoomListener = function () {
        var _this = this;
        this._dbr.child(this.getRoomLink()).on("value", function (snapshot) {
            _this.setThisFromRoom(Room.getRoomFromSnapshot(snapshot.val()));
            _this._roomSubject.next(_this);
        });
        return this._roomSubject;
    };
    //get room data without listening
    Room.prototype.getRoom = function () {
        return __awaiter(this, void 0, void 0, function () {
            var snapshot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._dbr.child(this.getRoomLink()).once("value")];
                    case 1:
                        snapshot = _a.sent();
                        this.setThisFromRoom(Room.getRoomFromSnapshot(snapshot.val()));
                        return [2 /*return*/, this];
                }
            });
        });
    };
    //copies room object data into current room
    Room.prototype.setThisFromRoom = function (room) {
        this.meta_data = room.meta_data;
        this.participants = room.participants;
        this.image = room.image;
        this.name = room.name;
        this.messages = room.messages;
        this.last_message = undefined;
    };
    //parse room using snapshot value
    Room.getRoomFromSnapshot = function (roomObj) {
        var room = class_transformer_1.plainToClass(Room, roomObj);
        var msgs = new Array();
        var participants = new Array();
        if (roomObj["messages"] != null) {
            var messageObj = roomObj["messages"];
            for (var property in messageObj) {
                var msg = messageObj[property];
                msg.id = property;
                msgs.push(msg);
            }
        }
        if (roomObj["participants"] != null) {
            var participantsObj = roomObj["participants"];
            for (var property in participantsObj) {
                var participant = participantsObj[property];
                participant.id = property;
                participants.push(participant);
            }
        }
        msgs = class_transformer_1.plainToClass(Message_1.Message, msgs);
        room.messages = msgs;
        room.participants = participants;
        return room;
    };
    //Sends a message that may contains text and/or attachments
    //Returns a SendMessageTask that could be used to track attachments upload progress
    Room.prototype.send = function (msg) {
        var _this = this;
        var _a, _b;
        if (_b = (_a = msg.attachments) === null || _a === void 0 ? void 0 : _a.length, (_b !== null && _b !== void 0 ? _b : 0 > 0)) {
            if (msg.attachments != undefined) {
                var sendMessageTask = new SendTask_1.SendMessageTask(this._createUploadAttachmentsTasks(msg.attachments));
                sendMessageTask.addOnCompleteListener(function (uploadedAttachments) {
                    console.log(uploadedAttachments);
                    msg.attachments = uploadedAttachments;
                    _this._dbr
                        .child("buffer/" + _this.id)
                        .push()
                        .set(JSON.parse(JSON.stringify(msg)));
                });
                sendMessageTask.startAllTasks();
                return sendMessageTask;
            }
        }
        this._dbr
            .child("buffer/" + this.id)
            .push()
            .set(JSON.parse(JSON.stringify(msg)));
        var x = new Map();
        x.set("send_task", new SendTask_1._SingleUploadTask(undefined, undefined));
        return new SendTask_1.SendMessageTask(x);
    };
    //assign each attachment to a SingleUploadTask
    //returns a map of {attachment_key:_SingleUploadTask}
    Room.prototype._createUploadAttachmentsTasks = function (attachments) {
        var _this = this;
        var uploadTasks = new Map();
        attachments.forEach(function (attachment) {
            var _a;
            var path = _this.id + "/" + Date.now();
            var singleTask = new SendTask_1._SingleUploadTask(attachment, path);
            //gives current timestamp as a key if no key passed to attachment
            uploadTasks.set((_a = attachment.key, (_a !== null && _a !== void 0 ? _a : Date.now())), singleTask);
        });
        return uploadTasks;
    };
    //TODO::[OPTIMIZATION]check if room last seen is the same as the package and ignore sending seen again
    //sets message as seen
    Room.prototype.setSeen = function (msg, seen) {
        if (seen === void 0) { seen = true; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!msg) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this._dbr
                                .child(this.getRoomLink() +
                                ("/participants/" + this._configs.getMyParticipantID()))
                                .update({ last_seen_message: msg.id })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Room;
}());
exports.Room = Room;
