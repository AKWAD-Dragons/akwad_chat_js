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
var firebase = require("firebase");
var rxjs_1 = require("rxjs");
var FirebaseChatConfigs_1 = require("../FirebaseChatConfigs");
var Room_1 = require("./Room");
//Lobby contains User Rooms(without messages essentially only contains last_message)
//and listen to it's updates
//the use case in mind was to use it to view Room details in a list of rooms
var Lobby = /** @class */ (function () {
    function Lobby() {
        this._roomsSubject = new rxjs_1.BehaviorSubject(undefined);
        this._configs = FirebaseChatConfigs_1.FirebaseChatConfigs.getInstance();
        this._dbr = firebase.database().ref();
    }
    //listen to lobby rooms updates(last_message, new participants, etc)
    Lobby.prototype.getLobbyListener = function () {
        var _this = this;
        this._dbr
            .child(this._configs.getUsersLink() +
            "/" +
            this._configs.getMyParticipantID() +
            "/rooms")
            .on("value", function (snapshot) {
            _this.setRoomsFromSnapshot(snapshot);
            _this._roomsSubject.next(_this.rooms);
        });
        return this._roomsSubject;
    };
    Lobby.prototype.setRoomsFromSnapshot = function (snapshot) {
        var _this = this;
        if (snapshot.val() == null)
            return [];
        if (this.rooms) {
            this.rooms.length = 0; // clearing old array reference
        }
        this.rooms = []; // setting new array reference
        Object.keys(snapshot.val()).forEach(function (key) {
            var _a;
            var room = snapshot.val()[key];
            var roomObj = Room_1.Room.getRoomFromSnapshot(room);
            roomObj.last_message = room.last_message;
            (_a = _this.rooms) === null || _a === void 0 ? void 0 : _a.push(Room_1.Room.getRoomFromSnapshot(room));
        });
        return this.rooms;
    };
    Lobby.prototype.initParticipant = function () {
        return __awaiter(this, void 0, void 0, function () {
            var value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._dbr
                            .child(this._configs.getUsersLink + "/" + this._configs.getMyParticipantID)
                            .once("value")];
                    case 1:
                        value = (_a.sent()).val();
                        this._myParticipant = value;
                        if (this._myParticipant == null) {
                            throw "Participant of ID ${_configs.myParticipantID} doesn't exist or the configs are not right";
                        }
                        this._myParticipant.id = this._configs.getMyParticipantID();
                        return [2 /*return*/];
                }
            });
        });
    };
    //get rooms without listening to them
    Lobby.prototype.getAllRooms = function () {
        return __awaiter(this, void 0, void 0, function () {
            var val;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._dbr
                            .child(this._configs.getUsersLink() +
                            "/" +
                            this._configs.getMyParticipantID() +
                            "/rooms")
                            .once("value")];
                    case 1:
                        val = _a.sent();
                        this.setRoomsFromSnapshot(val);
                        this._roomsSubject.next(this.rooms);
                        return [2 /*return*/, this.rooms];
                }
            });
        });
    };
    return Lobby;
}());
exports.Lobby = Lobby;
