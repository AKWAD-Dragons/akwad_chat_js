import firebase = require("firebase");
import { Observable } from "rxjs";
import { ChatAttachment } from "./models/ChatAttachment";
export declare class _SingleUploadTask {
    private _total?;
    private _progress?;
    attachment?: ChatAttachment;
    private _path?;
    storageReference: firebase.storage.Reference;
    total: () => number | undefined;
    progress: () => number | undefined;
    private _controller;
    stream: Observable<_TaskEvent | undefined>;
    constructor(attachment?: ChatAttachment, path?: string);
    private _updateProgress;
    start(): void;
    private _setCompleted;
}
export declare class SendMessageTask {
    private _taskMap;
    private _attachments;
    private _onCompleteCallBacks;
    private _onProgressCallBacks;
    private _count;
    private _totalSize;
    private _totalDone;
    totalSize: () => number;
    totalDone: () => number;
    constructor(taskMap: Map<String, _SingleUploadTask>);
    startAllTasks(): void;
    addOnCompleteListener(onCompleteCallBack: (f: Array<ChatAttachment>) => void): void;
    addOnProgressListener(onProgressCallBack: (task: SendMessageTask) => void): void;
    private _callOnCompleteCallBacks;
    private _callOnProgressCallBacks;
    getTaskByKey(key: String): _SingleUploadTask | undefined;
}
declare abstract class _TaskEvent {
}
export declare class TaskUpdateEvent extends _TaskEvent {
    private _total?;
    private _progress;
    total: () => number | undefined;
    progress: () => number;
    constructor(progress: number, total?: number);
}
export declare class TaskCompletedEvent extends _TaskEvent {
    private _uploadedAttachment;
    getUploadedAttachment: () => ChatAttachment;
    constructor(uploadedAttachment: ChatAttachment);
}
export {};
