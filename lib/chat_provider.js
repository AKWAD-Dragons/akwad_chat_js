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
//TODO::Copy variables, functions, classes privacy(private or public) from the Dart SDK
var FirebaseChatConfigs_1 = require("./FirebaseChatConfigs");
var Lobby_1 = require("./models/Lobby");
var firebase = require("firebase");
/*
  ***Starting Point***
  1-Before you call ChatProvider() you will first need to call
    *FirebaseChatConfigs.instance.init()

  2-call chatProvider.init(onTokenExpired)

  3-call chatProvider.getLobby() to start using the current user lobby

*/
var default_1 = /** @class */ (function () {
    function default_1() {
        this._isInit = false;
        if (!FirebaseChatConfigs_1.FirebaseChatConfigs.getInstance().isInit()) {
            throw "call FirebaseChatConfigs.instance.init() first";
        }
        this._lobby = new Lobby_1.Lobby();
    }
    /*
   *this function must be called to initialize the Chat User and authenticate him

   *Params:
      onTokenExpired()=>String: a callback function that gets called
        if the token passed is expired
        could be used to refresh token passed to FirebaseChatConfigs.init
   */
    default_1.prototype.init = function (onTokenExpired) {
        return __awaiter(this, void 0, void 0, function () {
            var user, creds;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = firebase.auth().currentUser;
                        if (user) {
                            FirebaseChatConfigs_1.FirebaseChatConfigs.getInstance().setMyParticipantID(user.uid);
                            this._isInit = true;
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, firebase
                                .auth()
                                .signInWithCustomToken(FirebaseChatConfigs_1.FirebaseChatConfigs.getInstance().getMyParticipantToken() || "")
                                .catch(function (ex) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b, _c;
                                var _d;
                                return __generator(this, function (_e) {
                                    switch (_e.label) {
                                        case 0:
                                            console.log("Token is invalid or expired\nretrying with onTokenExpired");
                                            _b = (_a = FirebaseChatConfigs_1.FirebaseChatConfigs.getInstance()).init;
                                            _c = {};
                                            return [4 /*yield*/, onTokenExpired()];
                                        case 1:
                                            _b.apply(_a, [(_c.myParticipantToken = _e.sent(),
                                                    _c)]);
                                            return [4 /*yield*/, firebase
                                                    .auth()
                                                    .signInWithCustomToken((_d = FirebaseChatConfigs_1.FirebaseChatConfigs.getInstance().getMyParticipantToken(), (_d !== null && _d !== void 0 ? _d : "")))
                                                    .then(function (value) { return (creds = value); })
                                                    .catch(function (e) {
                                                    throw e;
                                                })];
                                        case 2:
                                            _e.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        creds = _a.sent();
                        if (creds && creds.user) {
                            FirebaseChatConfigs_1.FirebaseChatConfigs.getInstance().setMyParticipantID(creds.user.uid);
                        }
                        this._isInit = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    default_1.prototype.deAuth = function () {
        firebase.auth().signOut();
    };
    //Returns lobby if it's safe to use lobby
    default_1.prototype.getLobby = function () {
        if (!this._isInit) {
            throw "must call init";
        }
        return this._lobby;
    };
    return default_1;
}());
exports.default = default_1;
var AttachmentTypes = /** @class */ (function () {
    function AttachmentTypes() {
    }
    AttachmentTypes.IMAGE = "image";
    AttachmentTypes.VIDEO = "video";
    AttachmentTypes.AUDIO = "audio";
    return AttachmentTypes;
}());
exports.AttachmentTypes = AttachmentTypes;
