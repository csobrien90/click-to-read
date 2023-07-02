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
4. Add stop hotkey to abort current reading


## To Do

### Finesse style on options page

- Make theme checkbox a light switch
- Make inputs and buttons look more like keyboard keys and improve hotkey setting UX
- Make voice settings knobs

### Make accessible

- Programmatically choose highlighted text color to contrast chosen highlight color
- Options page form (aria values for tabs, all inputs accessible, etc.)
- Focus styles and screenreader flow

### Long Term

- Publish to Chrome Web Store
- Add tests