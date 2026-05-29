// Madlions MAD 68HE — Per-Key RGB Plugin for SignalRGB
// Protocol reverse-engineered via WebHID interception of the official configurator.
//
// Packet format:
//   Data:   00 07 42 [bank] [offset] 08 [24 bytes RGB] 00 00 00
//   Commit: 00 07 41 01 00 3A FF 00 00 D2 (padded to 32)
//
// 5 banks × 2 packets each = 10 data packets per frame, plus 1 commit.
// Commit is sent after B0O0, before the remaining 9 packets.

export function Name()      { return "Madlions MAD 68HE"; }
export function Publisher() { return "Thushar"; }
export function VendorId()  { return 0x373B; }
export function ProductId() { return 0x105C; }
export function Type()      { return "hid"; }

export function ImageUrl() { 
    return "https://madlionskeyboard.com/wp-content/uploads/2024/11/MAD68-HE-keycaps.jpg"; 
}

export function ControllableParameters() {
    return [
        { "property": "shutdownColor", "group": "", "label": "Shutdown Color", "min": "0", "max": "360", "type": "color", "default": "#000000" },
        { "property": "forcedColor",   "group": "", "label": "Forced Color",   "min": "0", "max": "360", "type": "color", "default": "#000000" },
    ];
}

export function DefaultFrameRate() { return 60; }

// 68-key layout: 15 columns × 5 rows
export function Size() { return [15, 5]; }

export function LedNames() {
    return [
        "Key: Escape", "Key: 1", "Key: 2", "Key: 3", "Key: 4", "Key: 5",
        "Key: 6", "Key: 7", "Key: 8", "Key: 9", "Key: 0", "Key: -", "Key: =",
        "Key: Backspace", "Key: Insert",

        "Key: Tab", "Key: Q", "Key: W", "Key: E", "Key: R", "Key: T",
        "Key: Y", "Key: U", "Key: I", "Key: O", "Key: P", "Key: [", "Key: ]",
        "Key: \\", "Key: Delete",

        "Key: Caps Lock", "Key: A", "Key: S", "Key: D", "Key: F", "Key: G",
        "Key: H", "Key: J", "Key: K", "Key: L", "Key: ;", "Key: '",
        "Key: Enter", "Key: Page Up",

        "Key: Left Shift", "Key: Z", "Key: X", "Key: C", "Key: V", "Key: B",
        "Key: N", "Key: M", "Key: ,", "Key: .", "Key: /",
        "Key: Right Shift", "Key: Up Arrow", "Key: Page Down",

        "Key: Left Control", "Key: Left Windows", "Key: Left Alt",
        "Key: Space",
        "Key: Right Alt", "Key: Fn", "Key: Right Control",
        "Key: Left Arrow", "Key: Down Arrow", "Key: Right Arrow"
    ];
}

export function LedPositions() {
    return [
        [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],
        [8,0],[9,0],[10,0],[11,0],[12,0],[13,0],[14,0],

        [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],
        [8,1],[9,1],[10,1],[11,1],[12,1],[13,1],[14,1],

        [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],
        [8,2],[9,2],[10,2],[11,2],[13,2],[14,2],

        [0,3],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],
        [8,3],[9,3],[10,3],[12,3],[13,3],[14,3],

        [0,4],[1,4],[2,4],[5,4],
        [9,4],[10,4],[11,4],[12,4],[13,4],[14,4]
    ];
}

export function Validate(endpoint) {
    return endpoint.usage_page === 0xFF60;
}

export function ConflictingProcesses() {
    return [];
}

// Key map: [x, y, bank, slot]
// Slot 0-7 = offset 0 packet, slot 8-15 = offset 8 packet.
// Gaps exist where wide keys (CapsLock, Shifts, Space) leave unused matrix columns.
const keyMap = [
    // Row 0 (bank 0) — all 1u, sequential
    [0,0,0,0],[1,0,0,1],[2,0,0,2],[3,0,0,3],[4,0,0,4],[5,0,0,5],[6,0,0,6],[7,0,0,7],
    [8,0,0,8],[9,0,0,9],[10,0,0,10],[11,0,0,11],[12,0,0,12],[13,0,0,13],[14,0,0,14],

    // Row 1 (bank 1) — sequential
    [0,1,1,0],[1,1,1,1],[2,1,1,2],[3,1,1,3],[4,1,1,4],[5,1,1,5],[6,1,1,6],[7,1,1,7],
    [8,1,1,8],[9,1,1,9],[10,1,1,10],[11,1,1,11],[12,1,1,12],[13,1,1,13],[14,1,1,14],

    // Row 2 (bank 2) — CapsLock=0, A=1, sequential from there
    [0,2,2,0],[1,2,2,1],[2,2,2,2],[3,2,2,3],[4,2,2,4],[5,2,2,5],[6,2,2,6],[7,2,2,7],
    [8,2,2,8],[9,2,2,9],[10,2,2,10],[11,2,2,11],[13,2,2,12],[14,2,2,13],

    // Row 3 (bank 3) — LShift=0, gap at 1, Z=2 onward
    [0,3,3,0],[1,3,3,2],[2,3,3,3],[3,3,3,4],[4,3,3,5],[5,3,3,6],[6,3,3,7],
    [7,3,3,8],[8,3,3,9],[9,3,3,10],[10,3,3,11],[12,3,3,12],[13,3,3,13],[14,3,3,14],

    // Row 4 (bank 4) — LCtrl=0, LWin=1, LAlt=2, gap 3-6, Space=7, gap 8, RAlt=9 onward
    [0,4,4,0],[1,4,4,1],[2,4,4,2],[5,4,4,7],
    [9,4,4,9],[10,4,4,10],[11,4,4,11],[12,4,4,12],[13,4,4,13],[14,4,4,14]
];

let prevPackets = null;

export function Initialize() {
    prevPackets = null;
}

export function Render() {
    const packets = [];
    for (let b = 0; b < 5; b++) {
        packets[b] = [new Array(24).fill(0), new Array(24).fill(0)];
    }

    for (let i = 0; i < keyMap.length; i++) {
        const k = keyMap[i];
        const color = device.color(k[0], k[1]);
        const pktIdx  = k[3] < 8 ? 0 : 1;
        const bytePos = (k[3] < 8 ? k[3] : k[3] - 8) * 3;

        packets[k[2]][pktIdx][bytePos]     = color[0];
        packets[k[2]][pktIdx][bytePos + 1] = color[1];
        packets[k[2]][pktIdx][bytePos + 2] = color[2];
    }

    // skip write if nothing changed since last frame
    let changed = !prevPackets;
    if (!changed) {
        for (let b = 0; b < 5 && !changed; b++) {
            for (let p = 0; p < 2 && !changed; p++) {
                for (let i = 0; i < 24; i++) {
                    if (packets[b][p][i] !== prevPackets[b][p][i]) { changed = true; break; }
                }
            }
        }
    }

    if (changed) {
        SendBank(0, 0x00, packets[0][0]);
        SendCommit();
        SendBank(0, 0x08, packets[0][1]);
        for (let bank = 1; bank < 5; bank++) {
            SendBank(bank, 0x00, packets[bank][0]);
            SendBank(bank, 0x08, packets[bank][1]);
        }
    }

    prevPackets = packets;
}

export function Shutdown() {
    const black = new Array(24).fill(0);
    SendBank(0, 0x00, black);
    SendCommit();
    SendBank(0, 0x08, black);
    for (let bank = 1; bank < 5; bank++) {
        SendBank(bank, 0x00, black);
        SendBank(bank, 0x08, black);
    }
}

function SendBank(bank, offset, rgbData) {
    const packet = [
        0x00, 0x07, 0x42, bank, offset, 0x08,
        ...rgbData,
        0x00, 0x00, 0x00
    ];
    device.write(packet, packet.length);
}

function SendCommit() {
    const packet = [
        0x00, 0x07, 0x41, 0x01, 0x00, 0x3A,
        0xFF, 0x00, 0x00, 0xD2,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00,0x00,0x00,0x00,0x00,0x00,0x00,
        0x00
    ];
    device.write(packet, packet.length);
}
