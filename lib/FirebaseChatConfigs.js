"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    FirebaseChatConfigs.prototype.setMyParticipantID = function (id) {
        this._myParticipantID = id;
    };
    FirebaseChatConfigs.prototype.getMyParticipantToken = function () {
        this.checkNull(this._myParticipantToken, "myParticipantToken");
        return this._myParticipantToken;
    };
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
