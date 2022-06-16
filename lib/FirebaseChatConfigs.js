"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//Firebase Configs for ChatProvider
var FirebaseChatConfigs = /** @class */ (function () {
    function FirebaseChatConfigs() {
        this._isInit = false;
    }
    FirebaseChatConfigs.getInstance = function () {
        if (!FirebaseChatConfigs.instance) {
            FirebaseChatConfigs.instance = new FirebaseChatConfigs();
        }
        return FirebaseChatConfigs.instance;
    };
    FirebaseChatConfigs.prototype.isInit = function () {
        return this._isInit;
    };
    FirebaseChatConfigs.prototype.getRoomsLink = function () {
        this.checkNull(this._roomsLink, "roomLink");
        return this._roomsLink;
    };
    FirebaseChatConfigs.prototype.getUsersLink = function () {
        this.checkNull(this._usersLink, "usersLink");
        return this._usersLink;
    };
    FirebaseChatConfigs.prototype.getMyParticipantID = function () {
        this.checkNull(this._myParticipantID, "myParticipantID");
        return this._myParticipantID;
    };
    //User ID in Realtime DB
    FirebaseChatConfigs.prototype.setMyParticipantID = function (id) {
        this._myParticipantID = id;
    };
    FirebaseChatConfigs.prototype.getMyParticipantToken = function () {
        this.checkNull(this._myParticipantToken, "myParticipantToken");
        return this._myParticipantToken;
    };
    //Example Scheme
    //firebase-project-root:
    //  Rooms:
    //    -Mw91AWdawdaWDew3
    //  Users:
    //    -Mw31sfWdafa2Dewa
    //roomLink: link to Rooms node in realtime database
    //  for the example scheme that would be roomLink:"Rooms"
    //userLink: link to Users node in realtime database
    //  for the example scheme that would be roomLink:"Users"
    //myParticipantToken: a custom token that expires after one hour
    //  this token could be fetched through the cloud function createUser and refreshToken
    FirebaseChatConfigs.prototype.init = function (params) {
        var _a, _b, _c;
        this._isInit = true;
        this._roomsLink = (_a = params.roomsLink, (_a !== null && _a !== void 0 ? _a : this._roomsLink));
        this._usersLink = (_b = params.usersLink, (_b !== null && _b !== void 0 ? _b : this._usersLink));
        this._myParticipantToken = (_c = params.myParticipantToken, (_c !== null && _c !== void 0 ? _c : this._myParticipantToken));
    };
    FirebaseChatConfigs.prototype.checkNull = function (variable, name) {
        if (variable == null) {
            throw name + " is not set";
        }
    };
    return FirebaseChatConfigs;
}());
exports.FirebaseChatConfigs = FirebaseChatConfigs;
