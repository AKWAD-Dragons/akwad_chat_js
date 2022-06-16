"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var _SingleUploadTask = /** @class */ (function () {
    function _SingleUploadTask(attachment, path) {
        var _this = this;
        var _a, _b;
        this.storageReference = firebase.storage().ref();
        this.total = function () { return _this._total; };
        this.progress = function () { return _this._progress; };
        this._controller = new rxjs_1.BehaviorSubject(undefined);
        this.stream = this._controller.asObservable();
        this.attachment = attachment;
        this._path = path;
        this._total = (_b = (_a = this.attachment) === null || _a === void 0 ? void 0 : _a.file) === null || _b === void 0 ? void 0 : _b.size;
    }
    _SingleUploadTask.prototype._updateProgress = function (updatedProgress) {
        this._progress = updatedProgress;
        this._controller.next(new TaskUpdateEvent(this._progress, this._total));
    };
    _SingleUploadTask.prototype.start = function () {
        var _this = this;
        if (this.attachment == undefined || this._path == undefined)
            return;
        if (this.attachment.file == null)
            return;
        var task = this.storageReference
            .child(this._path)
            .put(this.attachment.file);
        task.on("state_changed", function (snapshot) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.attachment == undefined || this._path == undefined)
                    return [2 /*return*/];
                if (snapshot.state == "running") {
                    this._updateProgress(snapshot.bytesTransferred);
                }
                return [2 /*return*/];
            });
        }); }, function (error) {
            console.log(error.message);
        }, function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.attachment == undefined || this._path == undefined)
                            return [2 /*return*/];
                        this.attachment.file = undefined;
                        _a = this.attachment;
                        return [4 /*yield*/, task.snapshot.ref.getDownloadURL()];
                    case 1:
                        _a.fileLink = _b.sent();
                        this._setCompleted(this.attachment);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    _SingleUploadTask.prototype._setCompleted = function (uploadedAttachment) {
        this._controller.next(new TaskCompletedEvent(uploadedAttachment));
    };
    return _SingleUploadTask;
}());
exports._SingleUploadTask = _SingleUploadTask;
var SendMessageTask = /** @class */ (function () {
    function SendMessageTask(taskMap) {
        var _this = this;
        this._attachments = [];
        this._onCompleteCallBacks = [];
        this._onProgressCallBacks = [];
        this._count = 0;
        this._totalSize = 0;
        this._totalDone = new Map();
        this.totalSize = function () { return _this._totalSize; };
        this.totalDone = function () {
            var total = 0;
            _this._totalDone.forEach(function (value, key, map) {
                total += value.progress();
            });
            return total;
        };
        this._taskMap = taskMap;
        this._taskMap.forEach(function (value, key, map) {
            var _a;
            if (value.attachment != null) {
                _this._totalSize += (_a = value.total(), (_a !== null && _a !== void 0 ? _a : 0));
                _this._count++;
                value.stream.subscribe(function (event) {
                    if (event instanceof TaskUpdateEvent) {
                        _this._totalDone.set(key, event);
                        _this._callOnProgressCallBacks();
                    }
                    if (event instanceof TaskCompletedEvent) {
                        _this._attachments.push(event.getUploadedAttachment());
                        if (_this._attachments.length == _this._count &&
                            _this._onCompleteCallBacks.length != 0) {
                            _this._callOnCompleteCallBacks(_this._attachments);
                        }
                    }
                });
            }
        });
    }
    SendMessageTask.prototype.startAllTasks = function () {
        this._taskMap.forEach(function (value, key, map) {
            value.start();
        });
    };
    SendMessageTask.prototype.addOnCompleteListener = function (onCompleteCallBack) {
        this._onCompleteCallBacks.push(onCompleteCallBack);
    };
    SendMessageTask.prototype.addOnProgressListener = function (onProgressCallBack) {
        this._onProgressCallBacks.push(onProgressCallBack);
    };
    SendMessageTask.prototype._callOnCompleteCallBacks = function (attachments) {
        this._onCompleteCallBacks.forEach(function (callback) { return callback(attachments); });
    };
    SendMessageTask.prototype._callOnProgressCallBacks = function () {
        var _this = this;
        this._onProgressCallBacks.forEach(function (callback) { return callback(_this); });
    };
    SendMessageTask.prototype.getTaskByKey = function (key) {
        return this._taskMap.get(key);
    };
    return SendMessageTask;
}());
exports.SendMessageTask = SendMessageTask;
var _TaskEvent = /** @class */ (function () {
    function _TaskEvent() {
    }
    return _TaskEvent;
}());
var TaskUpdateEvent = /** @class */ (function (_super) {
    __extends(TaskUpdateEvent, _super);
    function TaskUpdateEvent(progress, total) {
        var _this = _super.call(this) || this;
        _this.total = function () { return _this._total; };
        _this.progress = function () { return _this._progress; };
        _this._progress = progress;
        _this._total = total;
        return _this;
    }
    return TaskUpdateEvent;
}(_TaskEvent));
exports.TaskUpdateEvent = TaskUpdateEvent;
var TaskCompletedEvent = /** @class */ (function (_super) {
    __extends(TaskCompletedEvent, _super);
    function TaskCompletedEvent(uploadedAttachment) {
        var _this = _super.call(this) || this;
        _this.getUploadedAttachment = function () { return _this._uploadedAttachment; };
        _this._uploadedAttachment = uploadedAttachment;
        return _this;
    }
    return TaskCompletedEvent;
}(_TaskEvent));
exports.TaskCompletedEvent = TaskCompletedEvent;
