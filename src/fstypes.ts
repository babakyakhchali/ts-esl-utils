export interface IFsConfMemberFlags {
    can_hear: boolean;
    can_see: boolean;
    can_speak: boolean;
    hold: boolean;
    mute_detect: boolean;
    talking: boolean;
    has_video: boolean;
    video_bridge: boolean;
    has_floor: boolean;
    is_moderator: boolean;
    end_conference: boolean;
}

export interface IFsConfMember {
    type: string;
    id: number;
    flags: IFsConfMemberFlags;
    uuid: string;
    caller_id_name: string;
    caller_id_number: string;
    join_time: number;
    last_talking: number;
    energy: number;
    volume_in: number;
    volume_out: number;
    'output-volume': number;
    'input-volume': number;
}

export interface IFsConference {
    conference_name: string;
    member_count: number;
    ghost_count: number;
    rate: number;
    run_time: number;
    conference_uuid: string;
    canvas_count: number;
    max_bw_in: number;
    force_bw_in: number;
    video_floor_packets: number;
    locked: boolean;
    destruct: boolean;
    wait_mod: boolean;
    audio_always: boolean;
    running: boolean;
    answered: boolean;
    enforce_min: boolean;
    bridge_to: boolean;
    dynamic: boolean;
    exit_sound: boolean;
    enter_sound: boolean;
    recording: boolean;
    video_bridge: boolean;
    video_floor_only: boolean;
    video_rfc4579: boolean;
    members: IFsConfMember[];
}