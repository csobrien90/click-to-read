# Click2Read

*This browser extension allows you to click an element to read the inner text aloud with the Web Speech API*


## Installation

1. Clone this repo
2. Open Chrome and go to `chrome://extensions`
3. Enable developer mode
4. Click "Load unpacked extension..."
5. Select the `src` directory


## Configuration

Open the extension's popup page to set/change your hotkey combination and adjust voice, pitch, rate, and volume


## Usage

1. Hold down a set hotkey combination
2. Click on any element to read the inner text aloud
3. If third hotkey is pressed, hovered element will be highlighted


## To Do

### Short Term

- Add option to customize hovered element highlight styles
- Finesse style on options page
- Add garbage collection to clean up old event listeners?
- Flesh out README to be more user-friendly
- Publish to Chrome Web Store

### Long Term

- Add more human voices - paid-tier premium voices?
- Add floating toolbar during speech for playback/playlist controls