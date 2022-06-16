import firebase = require("firebase");
import  { database } from "firebase";
import { BehaviorSubject, of, Subscribable } from "rxjs";
import { FirebaseChatConfigs } from "../FirebaseChatConfigs";
import { Participant } from "./Participant";
import { Room } from "./Room";
import { plainToClass } from "class-transformer";
import { Message } from "./Message";


//Lobby contains User Rooms(without messages essentially only contains last_message)
//and listen to it's updates
//the use case in mind was to use it to view Room details in a list of rooms

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

  //listen to lobby rooms updates(last_message, new participants, etc)
  getLobbyListener(): Subscribable<Room[] | undefined> {
    this._dbr
      .child(
        this._configs.getUsersLink() +
          "/" +
          this._configs.getMyParticipantID() +
          "/rooms"
      )
      .on("value", (snapshot) => {
        this.setRoomsFromSnapshot(snapshot);
        this._roomsSubject.next(this.rooms);
      });
    return this._roomsSubject;
  }

  setRoomsFromSnapshot(snapshot: database.DataSnapshot): Room[] {
    if (snapshot.val() == null) return [];
    if (this.rooms) {
      this.rooms.length = 0; // clearing old array reference
    }
    this.rooms = []; // setting new array reference
    Object.keys(snapshot.val()).forEach((key: string) => {
      let room = snapshot.val()[key];
      let roomObj = Room.getRoomFromSnapshot(room);
      roomObj.last_message = room.last_message as Message;
      this.rooms?.push(Room.getRoomFromSnapshot(room));
    });
    return this.rooms;
  }

  async initParticipant(): Promise<void> {
    let value = (
      await this._dbr
        .child(
          this._configs.getUsersLink + "/" + this._configs.getMyParticipantID
        )
        .once("value")
    ).val();
    this._myParticipant = value;
    if (this._myParticipant == null) {
      throw "Participant of ID ${_configs.myParticipantID} doesn't exist or the configs are not right";
    }

    this._myParticipant.id = this._configs.getMyParticipantID();
  }

  //get rooms without listening to them
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
