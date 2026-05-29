# Madlions MAD 68HE — SignalRGB Plugin

Per-key RGB control for the **Madlions MAD 68HE** mechanical keyboard in [SignalRGB](https://www.signalrgb.com/).

Protocol was reverse-engineered by intercepting the official web configurator via WebHID.

## Features

- Full per-key RGB control (68 keys)
- 60fps refresh rate with dirty-frame skipping
- Works with all SignalRGB effects and canvas layouts

## Installation

1. Download `MAD68HE.js`
2. Copy it to your SignalRGB plugins folder:
   ```
   %userprofile%\Documents\WhirlwindFX\Plugins\
   ```
3. Restart SignalRGB
4. The keyboard should appear as **Madlions MAD 68HE** in the device list

## Device Info

| Property | Value |
|----------|-------|
| Vendor ID | `0x373B` |
| Product ID | `0x105C` |
| HID Usage Page | `0xFF60` |
| Layout | 68-key (65%) ANSI |

## Protocol

The keyboard uses a bank-based per-key RGB protocol over HID:

- **Data packet:** `07 42 [bank] [offset] 08 [24 bytes of RGB]`
- **Commit packet:** `07 41 01 00 3A FF 00 00 D2`
- 5 banks (one per row) × 2 packets each (offset 0 and offset 8) = **10 data packets + 1 commit per frame**
- Commit is sent after the first data packet, before the remaining nine

### Key Matrix Layout

Each bank maps to a keyboard row. Wider modifier keys create gaps in the slot numbering:

| Bank | Row | Notes |
|------|-----|-------|
| 0 | Number row | Sequential, no gaps |
| 1 | QWERTY row | Sequential, no gaps |
| 2 | Home row | CapsLock=0, A=1, sequential |
| 3 | Shift row | LShift=0, gap at 1, Z=2 onward |
| 4 | Bottom row | LCtrl=0, LWin=1, LAlt=2, gaps 3-6, Space=7, gap 8, RAlt=9 onward |

## Troubleshooting

- **Keyboard not detected:** Make sure the official configurator web app is closed. Only one application can claim the HID endpoint.
- **Some keys show wrong colors:** The key matrix mapping may need adjustment for your firmware version. Open an issue with the key name and I'll fix it.

