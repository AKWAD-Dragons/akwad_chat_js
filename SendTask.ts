import firebase from "firebase";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { ChatAttachment } from "./models/ChatAttachment";

export class _SingleUploadTask {
  private _total?: number;
  private _progress?: number;
  attachment?: ChatAttachment;
  private _path?: string;
  storageReference: firebase.storage.Reference = firebase.storage().ref();

  total = () => this._total;

  progress = () => this._progress;

  private _controller: BehaviorSubject<
    _TaskEvent | undefined
  > = new BehaviorSubject<_TaskEvent | undefined>(undefined);

  stream: Observable<_TaskEvent | undefined>;

  constructor(attachment?: ChatAttachment, path?: string) {
    this.stream = this._controller.asObservable();
    this.attachment = attachment;
    this._path = path;
    this._total = this.attachment?.file?.size;
  }

  private _updateProgress(updatedProgress: number): void {
    this._progress = updatedProgress;
    this._controller.next(new TaskUpdateEvent(this._progress, this._total));
  }

  start(): void {
    if (this.attachment == undefined || this._path == undefined) return;
    if (this.attachment.file == null) return;
    let task = this.storageReference
      .child(this._path)
      .put(this.attachment.file);

    task.on(
      "state_changed",
      async (snapshot: firebase.storage.UploadTaskSnapshot) => {
        if (this.attachment == undefined || this._path == undefined) return;
        if (snapshot.state == "running") {
          this._updateProgress(snapshot.bytesTransferred);
        }
      },
      (error: Error) => {
        console.log(error.message);
      },
      async () => {
        if (this.attachment == undefined || this._path == undefined) return;
        this.attachment.file = undefined;
        this.attachment.fileLink = await task.snapshot.ref.getDownloadURL();
        this._setCompleted(this.attachment);
      }
    );
  }

  private _setCompleted(uploadedAttachment: ChatAttachment): void {
    this._controller.next(new TaskCompletedEvent(uploadedAttachment));
  }
}

export class SendMessageTask {
  private _taskMap: Map<String, _SingleUploadTask>;
  private _attachments: ChatAttachment[] = [];
  private _onCompleteCallBacks: Array<
    (attachments: ChatAttachment[]) => void
  > = [];
  private _onProgressCallBacks: Array<(task: SendMessageTask) => void> = [];

  private _count: number = 0;
  private _totalSize: number = 0;

  private _totalDone: Map<String, TaskUpdateEvent> = new Map<
    String,
    TaskUpdateEvent
  >();

  totalSize = () => this._totalSize;
  totalDone = () => {
    let total = 0;
    this._totalDone.forEach(
      (
        value: TaskUpdateEvent,
        key: String,
        map: Map<String, TaskUpdateEvent>
      ) => {
        total += value.progress();
      }
    );
    return total;
  };

  constructor(taskMap: Map<String, _SingleUploadTask>) {
    this._taskMap = taskMap;
    this._taskMap.forEach(
      (
        value: _SingleUploadTask,
        key: String,
        map: Map<String, _SingleUploadTask>
      ) => {
        if (value.attachment != null) {
          this._totalSize += value.total() ?? 0;
          this._count++;
          value.stream.subscribe((event) => {
            if (event instanceof TaskUpdateEvent) {
              this._totalDone.set(key, event);
              this._callOnProgressCallBacks();
            }
            if (event instanceof TaskCompletedEvent) {
              this._attachments.push(event.getUploadedAttachment());
              if (
                this._attachments.length == this._count &&
                this._onCompleteCallBacks.length != 0
              ) {
                this._callOnCompleteCallBacks(this._attachments);
              }
            }
          });
        }
      }
    );
  }

  startAllTasks(): void {
    this._taskMap.forEach(
      (
        value: _SingleUploadTask,
        key: String,
        map: Map<String, _SingleUploadTask>
      ) => {
        value.start();
      }
    );
  }

  addOnCompleteListener(
    onCompleteCallBack: (f: Array<ChatAttachment>) => void
  ): void {
    this._onCompleteCallBacks.push(onCompleteCallBack);
  }

  addOnProgressListener(
    onProgressCallBack: (task: SendMessageTask) => void
  ): void {
    this._onProgressCallBacks.push(onProgressCallBack);
  }

  private _callOnCompleteCallBacks(attachments: Array<ChatAttachment>): void {
    this._onCompleteCallBacks.forEach((callback) => callback(attachments));
  }

  private _callOnProgressCallBacks(): void {
    this._onProgressCallBacks.forEach((callback) => callback(this));
  }

  getTaskByKey(key: String): _SingleUploadTask | undefined {
    return this._taskMap.get(key);
  }
}

abstract class _TaskEvent {}

export class TaskUpdateEvent extends _TaskEvent {
  private _total?: number;
  private _progress: number;

  total = () => this._total;

  progress = () => this._progress;

  constructor(progress: number, total?: number) {
    super();
    this._progress = progress;
    this._total = total;
  }
}

export class TaskCompletedEvent extends _TaskEvent {
  private _uploadedAttachment: ChatAttachment;

  getUploadedAttachment = () => this._uploadedAttachment;

  constructor(uploadedAttachment: ChatAttachment) {
    super();
    this._uploadedAttachment = uploadedAttachment;
  }
}
