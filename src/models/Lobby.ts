import { FirebaseApp, initializeApp } from "firebase/app";
import {
  child,
  DatabaseReference,
  DataSnapshot,
  get,
  getDatabase,
  onValue,
  ref,
} from "firebase/database";
import { BehaviorSubject, of, Subscribable } from "rxjs";
import { FirebaseChatConfigs } from "../firebase.config";
import { Participant } from "./Participant";
import { Room } from "./Room";
import { Message } from "./Message";
import { lastValueFrom } from "rxjs";

//Lobby contains User Rooms(without messages essentially only contains last_message)
//and listen to it's updates
//the use case in mind was to use it to view Room details in a list of rooms

export class Lobby {
  private _configs: FirebaseChatConfigs;
  private _dbRef: DatabaseReference;
  private _myParticipant?: Participant;
  private rooms = new Map<String, Room>();
  private _userRoomConfigs = new Map<String, any>();

  private _roomsSubject: BehaviorSubject<Room | undefined> =
    new BehaviorSubject<Room | undefined>(undefined);

  constructor(
    private chatConfigs: FirebaseChatConfigs,
    private firebaseApp?: FirebaseApp
  ) {
    this._dbRef = ref(
      getDatabase(this.firebaseApp),
      `${this.chatConfigs.usersLink}/${this.chatConfigs.myParticipantID}`
    );

    // can't implement offline persistence as in mobile
  }

  /**
   * get rooms data from the database once.
   * to get an interactive reference use onValue()
   * @returns
   */
  // todo: rename to getRooms()
  getLobbyRooms(): Promise<Room[] | undefined> {
    return get(child(this._dbRef, this.chatConfigs.roomsLink)).then(
      (snapshot) => {
        console.log({ snapshot, data: snapshot.val() });
        return snapshot.val();
        // return snapshot.val()?.map((el: any) => {
        //   let [key, value] = el;
        //   let room = this._parseRoomFromSnapshotValue(key, value);
        //   if (room?.userRoomData) {
        //     this._userRoomConfigs.set(key, room.userRoomData);
        //   }
        //   return room;
        // });
      }
    );
  }

  //parse room from snapshot value
  _parseRoomFromSnapshotValue(key: string, value: Map<string, any>): Room {
    if (value) {
      value.set("messages", null);
      value.set("id", key);
    }

    // todo: return Map
    return value as unknown as Room;
  }

  /*

  // listen to lobby rooms updates(last_message, new participants, etc)
  getLobbyListener(): Subscribable<Room | undefined> {
    //get user rooms keys
    this.getLobbyRooms().then((lobbyRooms: Room[]) => {
      this._setLobbyRoomsListeners();
      lobbyRooms.forEach((room: Room) => {
        onValue(
          child(this._dbRef, `${this.chatConfigs.roomsLink}/${room.id}`),
          (snapshot: DataSnapshot) => {
            let room = this._parseRoomFromSnapshotValue(
              snapshot.key ?? "",
              snapshot.val()
            );

            if (
              room?.last_message?.id &&
              this._userRoomConfigs.get(room?.id ?? "")?.has("deleted_to") &&
              room?.last_message?.id >
                this._userRoomConfigs.get(room?.id ?? "").get("deleted_to")
            ) {
              // message is deleted
              return;
            }

            if (room.id) {
              this.rooms.set(room.id, room);
              this._roomsSubject.next(room);
            }
          }
        );
      });
    });
    return this._roomsSubject;
  }

  getUnreadRoomsCount(): Promise<number> {
    return (this.rooms ? Promise.resolve(this.rooms) : this.getAllRooms()).then(
      (rooms) => {
        this.rooms = rooms;
        return Array.from(rooms).reduce((total, value) => {
          if (value[1].getUnreadMessagesCount() > 0) {
            total++;
          }
          return total;
        }, 0);
      }
    );
  }

  async _setLobbyRoomsListeners() {
    onValue(this._dbRef, (snapshot) => {
      let room = this._parseRoomFromSnapshotValue(
        snapshot.key ?? "",
        snapshot.val()
      );
      if (room != null) {
        this._userRoomConfigs.set(room.id ?? "", room.userRoomData);
      }
    });
  }

  //get rooms without listening to them
  async getAllRooms(): Promise<Map<String, Room>> {
    return get(child(this._dbRef, this.chatConfigs.roomsLink)).then((snapshot) =>
      Promise.all(
        snapshot
          .val()
          .values?.map((el: Map<String, any>) =>
            child(this._dbRef, `${this.chatConfigs.roomsLink}/${el.get("id")}`)
          )
      )
        .then((dataSnaps) => this._filterDataSnaps(snapshot, dataSnaps))
        .then((dataSnaps) => this._parseRoomsFromSnapshots(dataSnaps))
    );
  }

  _filterDataSnaps(lobby: DataSnapshot, rooms: DataSnapshot[]): DataSnapshot[] {
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

 

  async initParticipant(): Promise<void> {
    onValue(this._databaseParticipantPath, (snapshot) => {});
    let value = (
      await this._dbRef
        .child(
          this.chatConfigs.getUsersLink + "/" + this.chatConfigs.getMyParticipantID
        )
        .once("value")
    ).val();
    this._myParticipant = value;
    if (this._myParticipant == null) {
      throw "Participant of ID ${this.chatConfigs.getMyParticipantID} doesn't exist or the configs are not right";
    }

    this._myParticipant.id = this.chatConfigs.getMyParticipantID();
  }
  */
}
