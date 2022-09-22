import { database } from "firebase";
import { Subscribable } from "rxjs";
import { Room } from "./Room";
export declare class Lobby {
    private _configs;
    private _dbr;
    private _myParticipant?;
    private rooms;
    private _userRoomConfigs;
    private _roomsSubject;
    constructor();
    getLobbyListener(): Subscribable<Room | undefined>;
    getUnreadRoomsCount(): Promise<number>;
    getLobbyRooms(): Promise<Room[]>;
    _setLobbyRoomsListeners(): Promise<void>;
    getAllRooms(): Promise<Map<String, Room>>;
    _filterDataSnaps(lobby: database.DataSnapshot, rooms: database.DataSnapshot[]): database.DataSnapshot[];
    _parseRoomsFromSnapshots(snapshots: database.DataSnapshot[]): Map<String, Room>;
    _parseRoomFromSnapshotValue(key: string, valueMap: Map<string, any>): Room | null;
    initParticipant(): Promise<void>;
}
