export interface ParticipantParams {
  id?: string;
  name: string;
  permissions?: string[];
}

//Chat Participant data
export class Participant {
  id?: string;
  name: string;
  meta_data?: Object;
  last_seen_message?: string;
  last_seen_message_index?: number;
  rooms?: string[];
  permissions?: string[];

  constructor(params: ParticipantParams) {
    this.id = params.id;
    this.name = params.name;
    this.permissions = params.permissions;
  }
}
