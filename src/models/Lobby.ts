import firebase = require("firebase");
import { database } from "firebase";
import { BehaviorSubject, of, Subscribable } from "rxjs";
import { FirebaseChatConfigs } from "../firebase.config";
import { Participant } from "./Participant";
import { Room } from "./Room";
import { Message } from "./Message";

//Lobby contains User Rooms(without messages essentially only contains last_message)
//and listen to it's updates
//the use case in mind was to use it to view Room details in a list of rooms

export class Lobby {
  private _configs: FirebaseChatConfigs;
  private _dbr: firebase.database.Reference;
  private _myParticipant?: Participant;
  private rooms = new Map<String, Room>();
  private _userRoomConfigs = new Map<String, any>();

  private _roomsSubject: BehaviorSubject<Room | undefined> =
    new BehaviorSubject<Room | undefined>(undefined);

  constructor() {
    this._configs = FirebaseChatConfigs.getInstance();
    this._dbr = firebase.database().ref();
    // can't implement offline persistence as in mobile
  }

  // listen to lobby rooms updates(last_message, new participants, etc)
  getLobbyListener(): Subscribable<Room | undefined> {
    //get user rooms keys
    this.getLobbyRooms().then((lobbyRooms: Room[]) => {
      this._setLobbyRoomsListeners();
      lobbyRooms.forEach((room: Room) => {
        this._dbr.child(this._configs.getRoomsLink + "/" + room.id).off();
        this._dbr
          .child(this._configs.getRoomsLink + "/" + room.id)
          .on("value", (roomSnapshot: database.DataSnapshot) => {
            let room = this._parseRoomFromSnapshotValue(
              roomSnapshot.key ?? "",
              roomSnapshot.val()
            );
            let isDeleted: boolean = false;
            if (
              (room?.last_message ?? null) != null &&
              this._userRoomConfigs.has(room?.id ?? "") &&
              this._userRoomConfigs.get(room?.id ?? "").has("deleted_to")
            ) {
              isDeleted =
                (room?.last_message?.id ?? "") >
                this._userRoomConfigs.get(room?.id ?? "").get("deleted_to");
            }
            if (isDeleted) {
              return;
            }
            if (room != null && room.id != null) {
              this.rooms.set(room.id, room);
              this._roomsSubject.next(room);
            }
          });
      });
    });
    return this._roomsSubject;
  }

  //get unread rooms count
  async getUnreadRoomsCount(): Promise<number> {
    let unreadRoomsCount = 0;
    if (this.rooms == null) {
      this.rooms = await this.getAllRooms();
    }

    this.rooms.forEach((room: Room, key: String) => {
      if (room.getUnreadMessagesCount() > 0) {
        unreadRoomsCount++;
      }
    });
    return unreadRoomsCount;
  }

  //get lobby rooms
  async getLobbyRooms(): Promise<Room[]> {
    let snapshot = await this._dbr
      .child(
        this._configs.getUsersLink +
          "/" +
          this._configs.getMyParticipantID +
          "/rooms"
      )
      .once("value");

    let rooms = new Array<Room>();
    if (snapshot.val() != null) {
      snapshot.val().forEach((key: any, value: any) => {
        let room = this._parseRoomFromSnapshotValue(key, value);
        if (room != null) {
          rooms.push(room);
          if (room.userRoomData != null) {
            this._userRoomConfigs.set(key, room.userRoomData);
          }
        }
      });
    }
    return rooms;
  }

  async _setLobbyRoomsListeners() {
    this._dbr
      .child(
        this._configs.getUsersLink +
          "/" +
          this._configs.getMyParticipantID +
          "/rooms"
      )
      .off();
    this._dbr
      .child(
        this._configs.getUsersLink +
          "/" +
          this._configs.getMyParticipantID +
          "/rooms"
      )
      .on("value", (event) => {
        let room = this._parseRoomFromSnapshotValue(
          event.key ?? "",
          event.val()
        );
        if (room != null) {
          this._userRoomConfigs.set(room.id ?? "", room.userRoomData);
        }
      });
  }

  //get rooms without listening to them
  async getAllRooms(): Promise<Map<String, Room>> {
    let snapshot: database.DataSnapshot = await this._dbr
      .child(
        this._configs.getUsersLink +
          "/" +
          this._configs.getMyParticipantID +
          "/rooms"
      )
      .once("value");
    let futures = new Array<Promise<database.DataSnapshot>>();
    if (snapshot.val()?.values != null) {
      snapshot.val().values.forEach((valueMap: Map<String, any>) => {
        futures.push(
          this._dbr
            .child(this._configs.getRoomsLink + "/" + valueMap.get("id"))
            .once("value")
        );
      });
    }
    let dataSnaps: database.DataSnapshot[] = await Promise.all(futures);
    dataSnaps = this._filterDataSnaps(snapshot, dataSnaps);
    this.rooms = this._parseRoomsFromSnapshots(dataSnaps);
    return this.rooms;
  }

  _filterDataSnaps(
    lobby: database.DataSnapshot,
    rooms: database.DataSnapshot[]
  ): database.DataSnapshot[] {
    let lobbyRooms = lobby.val()?.values;
    return rooms.filter((room) => {
      let lobbyRoom: Map<string, any> = lobbyRooms.firstWhere(
        (lobbyRoom: Map<String, any>) => lobbyRoom.get("id") == room.key
      );
      if (!lobbyRoom.has("data") || !lobbyRoom.get("data").has("deleted_to")) {
        return true;
      }
      if (!room.val().has("last_message")) {
        return true;
      }
      return (
        room
          .val()
          .get("last_message")
          .get("id")
          .compareTo(lobbyRoom.get("data").get("deleted_to")) > 0
      );
    });
  }

  //parse rooms from snapshot value
  _parseRoomsFromSnapshots(
    snapshots: database.DataSnapshot[]
  ): Map<String, Room> {
    let rooms = new Map<String, Room>();
    snapshots.forEach((dataSnap: database.DataSnapshot) => {
      let room = this._parseRoomFromSnapshotValue(
        dataSnap.key ?? "",
        dataSnap.val()
      );
      if (room != null) {
        rooms.set(dataSnap.key ?? "", room);
      }
    });
    return rooms;
  }

  //parse room from snapshot value
  _parseRoomFromSnapshotValue(
    key: string,
    valueMap: Map<string, any>
  ): Room | null {
    if (valueMap == null) return null;
    valueMap.set("messages", null);
    valueMap.set("id", key);
    return valueMap as unknown as Room;
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
      throw "Participant of ID ${this._configs.getMyParticipantID} doesn't exist or the configs are not right";
    }

    this._myParticipant.id = this._configs.getMyParticipantID();
  }
}
