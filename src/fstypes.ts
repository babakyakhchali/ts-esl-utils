export interface ICall {
    uuid: string;
    direction: string;
    created: string;
    created_epoch: string;
    name: string;
    state: string;
    cid_name: string;
    cid_num: string;
    ip_addr: string;
    dest: string;
    presence_id: string;
    presence_data: string;
    accountcode: string;
    callstate: string;
    callee_name: string;
    callee_num: string;
    callee_direction: string;
    call_uuid: string;
    hostname: string;
    sent_callee_name: string;
    sent_callee_num: string;
    b_uuid: string;
    b_direction: string;
    b_created: string;
    b_created_epoch: string;
    b_name: string;
    b_state: string;
    b_cid_name: string;
    b_cid_num: string;
    b_ip_addr: string;
    b_dest: string;
    b_presence_id: string;
    b_presence_data: string;
    b_accountcode: string;
    b_callstate: string;
    b_callee_name: string;
    b_callee_num: string;
    b_callee_direction: string;
    b_sent_callee_name: string;
    b_sent_callee_num: string;
    call_created_epoch: string;
}

export interface IChannel {
    uuid: string;
    direction: string;
    created: string;
    created_epoch: string;
    name: string;
    state: string;
    cid_name: string;
    cid_num: string;
    ip_addr: string;
    dest: string;
    application: string;
    application_data: string;
    dialplan: string;
    context: string;
    read_codec: string;
    read_rate: string;
    read_bit_rate: string;
    write_codec: string;
    write_rate: string;
    write_bit_rate: string;
    secure: string;
    hostname: string;
    presence_id: string;
    presence_data: string;
    accountcode: string;
    callstate: string;
    callee_name: string;
    callee_num: string;
    callee_direction: string;
    call_uuid: string;
    sent_callee_name: string;
    sent_callee_num: string;
    initial_cid_name: string;
    initial_cid_num: string;
    initial_ip_addr: string;
    initial_dest: string;
    initial_dialplan: string;
    initial_context: string;
}

export interface IShowResult<T> {
    row_count: number;
    rows: T[]
}

export const CCAgentStatusData = [
    {
        "status": "Logged Out",
        "help": "Cannot receive queue calls."
    },
    {
        "status": "Available",
        "help": "Ready to receive queue calls."
    },
    {
        "status": "Available (On Demand)",
        "help": "State will be set to 'Idle' once the call ends (not automatically set to 'Waiting')."
    },
    {
        "status": "On Break",
        "help": "Still Logged in"
    }
]

export type CCAgentStatus = 'Logged Out'|'Available'|'Available (On Demand)'|'On Break';
export interface ICCTier {
    queue: string;
    agent: string;
    state: string;
    level: number;
    position: number;
}

export interface ICCQueue {    
    name: string;
    strategy: string;
    moh_sound: string;
    time_base_score: string;
    tier_rules_apply: string;
    tier_rule_wait_second: string;
    tier_rule_wait_multiply_level: string;
    tier_rule_no_agent_no_wait: string;
    discard_abandoned_after: string;
    abandoned_resume_allowed: string;
    max_wait_time: string;
    max_wait_time_with_no_agent: string;
    max_wait_time_with_no_agent_time_reached: string;
    record_template: string;
    calls_answered: string;
    calls_abandoned: string;
    ring_progressively_delay: string;
    skip_agents_with_external_calls: string;
    agent_no_answer_status: string;    
}

export interface ICCAgent {
    queue: string;
    system: string;
    uuid: string;
    session_uuid: string;
    cid_number: number;
    cid_name: string;
    system_epoch: number;
    joined_epoch: number;
    rejoined_epoch: number;
    bridge_epoch: number;
    abandoned_epoch: number;
    base_score: number;
    skill_score: number;
    serving_agent: string;
    serving_system: string;
    state: string;
    score: number;
}

export interface ICCMember {
    queue: string;
    system: string;
    uuid: string;
    session_uuid: string;
    cid_number: number;
    cid_name: string;
    system_epoch: number;
    joined_epoch: number;
    rejoined_epoch: number;
    bridge_epoch: number;
    abandoned_epoch: number;
    base_score: number;
    skill_score: number;
    serving_agent: string;
    serving_system: string;
    state: string;
    score: number;
}

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

export interface IChannelData {
    'Event-Name': string;
    'Core-UUID': string;
    'FreeSWITCH-Hostname': string;
    'FreeSWITCH-Switchname': string;
    'FreeSWITCH-IPv4': string;
    'FreeSWITCH-IPv6': string;
    'Event-Date-Local': string;
    'Event-Date-GMT': string;
    'Event-Date-Timestamp': string;
    'Event-Calling-File': string;
    'Event-Calling-Function': string;
    'Event-Calling-Line-Number': string;
    'Event-Sequence': string;
    'Channel-Direction': string;
    'Channel-Logical-Direction': string;
    'Channel-Username': string;
    'Channel-Dialplan': string;
    'Channel-Caller-ID-Name': string;
    'Channel-Caller-ID-Number': string;
    'Channel-Orig-Caller-ID-Name': string;
    'Channel-Orig-Caller-ID-Number': string;
    'Channel-Network-Addr': string;
    'Channel-ANI': string;
    'Channel-Destination-Number': string;
    'Channel-Unique-ID': string;
    'Channel-Source': string;
    'Channel-Context': string;
    'Channel-Channel-Name': string;
    'Channel-Profile-Index': string;
    'Channel-Profile-Created-Time': string;
    'Channel-Channel-Created-Time': string;
    'Channel-Channel-Answered-Time': string;
    'Channel-Channel-Progress-Time': string;
    'Channel-Channel-Progress-Media-Time': string;
    'Channel-Channel-Hangup-Time': string;
    'Channel-Channel-Transfer-Time': string;
    'Channel-Channel-Resurrect-Time': string;
    'Channel-Channel-Bridged-Time': string;
    'Channel-Channel-Last-Hold': string;
    'Channel-Channel-Hold-Accum': string;
    'Channel-Screen-Bit': string;
    'Channel-Privacy-Hide-Name': string;
    'Channel-Privacy-Hide-Number': string;
    'Channel-State': string;
    'Channel-Call-State': string;
    'Channel-State-Number': string;
    'Channel-Name': string;
    'Unique-ID': string;
    'Call-Direction': string;
    'Presence-Call-Direction': string;
    'Channel-HIT-Dialplan': string;
    'Channel-Call-UUID': string;
    'Answer-State': string;
    'Caller-Direction': string;
    'Caller-Logical-Direction': string;
    'Caller-Username': string;
    'Caller-Dialplan': string;
    'Caller-Caller-ID-Name': string;
    'Caller-Caller-ID-Number': string;
    'Caller-Orig-Caller-ID-Name': string;
    'Caller-Orig-Caller-ID-Number': string;
    'Caller-Network-Addr': string;
    'Caller-ANI': string;
    'Caller-Destination-Number': string;
    'Caller-Unique-ID': string;
    'Caller-Source': string;
    'Caller-Context': string;
    'Caller-Channel-Name': string;
    'Caller-Profile-Index': string;
    'Caller-Profile-Created-Time': string;
    'Caller-Channel-Created-Time': string;
    'Caller-Channel-Answered-Time': string;
    'Caller-Channel-Progress-Time': string;
    'Caller-Channel-Progress-Media-Time': string;
    'Caller-Channel-Hangup-Time': string;
    'Caller-Channel-Transfer-Time': string;
    'Caller-Channel-Resurrect-Time': string;
    'Caller-Channel-Bridged-Time': string;
    'Caller-Channel-Last-Hold': string;
    'Caller-Channel-Hold-Accum': string;
    'Caller-Screen-Bit': string;
    'Caller-Privacy-Hide-Name': string;
    'Caller-Privacy-Hide-Number': string;
    variable_direction: string;
    variable_uuid: string;
    variable_session_id: string;
    variable_sip_from_user: string;
    variable_sip_from_port: string;
    variable_sip_from_uri: string;
    variable_sip_from_host: string;
    variable_video_media_flow: string;
    variable_audio_media_flow: string;
    variable_text_media_flow: string;
    variable_channel_name: string;
    variable_sip_call_id: string;
    variable_sip_local_network_addr: string;
    variable_sip_network_ip: string;
    variable_sip_network_port: string;
    variable_sip_invite_stamp: string;
    variable_sip_received_ip: string;
    variable_sip_received_port: string;
    variable_sip_via_protocol: string;
    variable_sip_from_user_stripped: string;
    variable_sip_from_tag: string;
    variable_sofia_profile_name: string;
    variable_sofia_profile_url: string;
    variable_recovery_profile_name: string;
    variable_sip_full_via: string;
    variable_sip_full_from: string;
    variable_sip_full_to: string;
    variable_sip_allow: string;
    variable_sip_req_user: string;
    variable_sip_req_port: string;
    variable_sip_req_uri: string;
    variable_sip_req_host: string;
    variable_sip_to_user: string;
    variable_sip_to_port: string;
    variable_sip_to_uri: string;
    variable_sip_to_host: string;
    variable_sip_contact_user: string;
    variable_sip_contact_port: string;
    variable_sip_contact_uri: string;
    variable_sip_contact_host: string;
    variable_rtp_use_codec_string: string;
    variable_sip_user_agent: string;
    variable_sip_via_host: string;
    variable_sip_via_port: string;
    variable_sip_via_rport: string;
    variable_max_forwards: string;
    variable_switch_r_sdp: string;
    variable_ep_codec_string: string;
    variable_endpoint_disposition: string;
    variable_call_uuid: string;
    variable_current_application_data: string;
    variable_current_application: string;
    variable_socket_host: string;
    'Content-Type': string;
    'Reply-Text': string;
    'Socket-Mode': string;
    Control: string;
    'Modesl-Reply-OK': string;
    'Content-Length': number;
}

