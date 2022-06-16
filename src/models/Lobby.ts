import firebase = require("firebase");
import { BehaviorSubject, from, Subscribable } from "rxjs";
import { FirebaseChatConfigs } from "../FirebaseChatConfigs";
import { Participant } from "./Participant";
import { Room } from "./Room";
import { plainToClass } from "class-transformer";
export class Lobby {
  private _configs: FirebaseChatConfigs;
  private _dbr: firebase.database.Reference;
  private _myParticipant?: Participant;
  private rooms?: Room[];

  private _roomsSubject: BehaviorSubject<
    Room[] | undefined
  > = new BehaviorSubject<Room[] | undefined>(undefined);

  constructor() {
    this._configs = FirebaseChatConfigs.getInstance();
    this._dbr = firebase.database().ref();
  }

  getLobbyListener(): Subscribable<Room[] | undefined> {
    this._dbr
      .child(
        this._configs.getUsersLink() +
          "/" +
          this._configs.getMyParticipantID() +
          "/rooms"
      )
      .on("value", (snapshot: any) => {
        this.setRoomsFromSnapshot(snapshot);
        this._roomsSubject.next(this.rooms);
      });
    return this._roomsSubject;
  }

  setRoomsFromSnapshot(snapshot: firebase.database.DataSnapshot): Room[] {
    if (snapshot.val() == null) return [];
    this.rooms = plainToClass(Room, Object.values(snapshot.val()));
    return this.rooms;
  }

  async initParticipant(): Promise<void> {
    let value = (
      await this._dbr
        .child(
          this._configs.getUsersLink + "/" + this._configs.getMyParticipantID
        )
        .once("value")
    ).val;
    this._myParticipant = value;
    if (this._myParticipant == null){
      throw "Participant of ID ${_configs.myParticipantID} doesn't exist or the configs are not right";
    }
    this._myParticipant.id = this._configs.getMyParticipantID();
  }

  async getAllRooms(): Promise<Room[] | undefined> {
    let val = await this._dbr
      .child(
        this._configs.getUsersLink() +
          "/" +
          this._configs.getMyParticipantID() +
          "/rooms"
      )
      .once("value");
    this.setRoomsFromSnapshot(val);
    this._roomsSubject.next(this.rooms);
    return this.rooms;
  }
}
