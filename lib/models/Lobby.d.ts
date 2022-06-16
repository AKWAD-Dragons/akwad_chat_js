import firebase = require("firebase");
import { Subscribable } from "rxjs";
import { Room } from "./Room";
export declare class Lobby {
    private _configs;
    private _dbr;
    private _myParticipant?;
    private rooms?;
    private _roomsSubject;
    constructor();
    getLobbyListener(): Subscribable<Room[] | undefined>;
    setRoomsFromSnapshot(snapshot: firebase.database.DataSnapshot): Room[];
    initParticipant(): Promise<void>;
    getAllRooms(): Promise<Room[] | undefined>;
}
