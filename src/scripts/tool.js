class Click2ReadTool {
	constructor() {
		this.keysPressed = {}
		this.highlightedElement = null
		this.voices = []
		this.hotkeys = {
			hotkey1: 'q',
			hotkey2: 'w',
			hotkey3: 'e',
			hotkey4: 'r'
		}
	}

	init() {
		// Load hotkeys and options from storage
		this.loadHotkeys()

		/*
		---------------------------
		|     Event Listeners     |
		---------------------------
		*/

		// On mouse move, if hotkeys are pressed, highlight hovered element
		window.addEventListener('mousemove', (e) => {
			if (!this.keysPressed[this.hotkeys['hotkey1']] || !this.keysPressed[this.hotkeys['hotkey2']] || !this.keysPressed[this.hotkeys['hotkey3']]) return
			
			const hoveredElement = document.elementFromPoint(e.clientX, e.clientY)
			
			if (this.highlightedElement !== hoveredElement) {
				hoveredElement.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'
				hoveredElement.addEventListener('mouseleave', () => {
					hoveredElement.style.backgroundColor = ''
				})
				if (this.highlightedElement) {
					this.highlightedElement.style.backgroundColor = 'initial'
					this.highlightedElement.removeEventListener('mouseleave', () => {
						this.highlightedElement.style.backgroundColor = ''
					})
				}
				this.highlightedElement = hoveredElement
			}
		});

		// Track pressed keys
		window.addEventListener('keydown', (e) => {
			this.keysPressed[e.key] = true

			// If stop hotkey combination is pressed, cancel speech
			if (this.keysPressed[this.hotkeys['hotkey1']] && this.keysPressed[this.hotkeys['hotkey2']] && this.keysPressed[this.hotkeys['hotkey4']]) {
				window.speechSynthesis.cancel()
			}
		})

		window.addEventListener('keyup', (e) => {
			this.keysPressed[e.key] = false
		})

		// Core functionality - if hotkeys are pressed, read text of clicked element
		window.addEventListener('click', (e) => {
			if (this.keysPressed[this.hotkeys['hotkey1']] && this.keysPressed[this.hotkeys['hotkey2']]) {
				this.speak(e.target.innerText)
			}
		});
	}

	async speak(text) {
		if ('speechSynthesis' in window) {
			// Create an utterance object
			const synthesis = window.speechSynthesis;
			const utterance = new SpeechSynthesisUtterance(text);

			// Get voices
			if (this.voices.length === 0) {
				synthesis.onvoiceschanged = () => {this.voices = synthesis.getVoices()}
			}

			// Set utterance properties
			chrome.storage.sync.get(['voice', 'rate', 'pitch', 'volume'], (options) => {
				utterance.rate = options.rate
				utterance.pitch = options.pitch
				utterance.volume = options.volume
				utterance.voice = this.voices.find(voice => voice.name === options.voice)

				// Speak the utterance
				synthesis.speak(utterance);
			})

		} else {
			console.log('Text-to-speech not supported.');
		}
	}

	setHotkeys(keys) {
		this.hotkeys = keys
	}

	loadHotkeys() {
		const defaultHotkeys = {
			hotkey1: 'q',
			hotkey2: 'w',
			hotkey3: 'e',
			hotkey4: 'r'
		}

		chrome.storage.sync.get(['hotkey1', 'hotkey2', 'hotkey3', 'hotkey4'], (storedKeys) => {
			if (Object.keys(storedKeys).length === 0) {
				chrome.storage.sync.set(defaultHotkeys, () => {
					console.log('Click2Read hotkeys set to default')
				})
			} else if (
				storedKeys.hasOwnProperty('hotkey1') && 
				storedKeys.hasOwnProperty('hotkey2') && 
				storedKeys.hasOwnProperty('hotkey3') && 
				storedKeys.hasOwnProperty('hotkey4')) {
					console.log('Click2Read hotkeys loaded')
					this.setHotkeys(storedKeys)
			} else {
				chrome.storage.sync.set(defaultHotkeys, () => {
					console.log('Click2Read hotkeys set to default')
				})
			}
		})
	}
}

const tool = new Click2ReadTool()
tool.init()