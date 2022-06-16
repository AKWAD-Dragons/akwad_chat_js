"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//Chat Participant data
var Participant = /** @class */ (function () {
    function Participant(params) {
        this.id = params.id;
        this.name = params.name;
        this.permissions = params.permissions;
    }
    return Participant;
}());
exports.Participant = Participant;
