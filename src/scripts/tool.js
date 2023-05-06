class Click2ReadTool {
	constructor() {
		this.keysPressed = {}
		this.highlightedElement = null
		this.highlightedElementBackgroundColor = ''
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
			if (!hoveredElement) return

			if (this.highlightedElement !== hoveredElement) {
				this.highlightedElementBackgroundColor = hoveredElement.style.backgroundColor

				hoveredElement.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'
				hoveredElement.addEventListener('mouseleave', () => {
					hoveredElement.style.backgroundColor = this.highlightedElementBackgroundColor
				})
				if (this.highlightedElement) {
					this.highlightedElement.style.backgroundColor = this.highlightedElementBackgroundColor
					this.highlightedElement.removeEventListener('mouseleave', () => {
						this.highlightedElement.style.backgroundColor = this.highlightedElementBackgroundColor
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
				e.preventDefault()

				// If clicked element has many children, loop through them and read them all
				if (e.target.children.length > 20) {
					const children = Array.from(e.target.children)
					children.forEach(child => this.determineWhatToRead(child))
				} else {
					// If clicked element has no children, read it
					this.determineWhatToRead(e.target)
				}
			}
		});

		// Get voices
		const voicePromise = new Promise((resolve) => {
			const synth = window.speechSynthesis
			const id = setInterval(() => {
				const voices = synth.getVoices()
				if (voices.length !== 0) {
					clearInterval(id)
					resolve(voices)
				}
			}, 10)
		})

		voicePromise.then((voices) => {
			this.setVoices(voices)
		})
	}


	/*
	---------------------------
	|	    Functions		  |
	---------------------------
	*/

	async readAloud(text) {
		try {
			if ('speechSynthesis' in window) {
				// Cancel any current speech
				const synthesis = window.speechSynthesis;
				synthesis.cancel()
				
				// Create an utterance object
				const utterance = new SpeechSynthesisUtterance(text);

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
		} catch (error) {
			console.error('Wild ERROR has appeared!' + error)
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
					this.setHotkeys(storedKeys)
			} else {
				chrome.storage.sync.set(defaultHotkeys, () => {
					console.log('Click2Read hotkeys set to default')
				})
			}
		})
	}

	setVoices(voices) {
		this.voices = voices
	}

	getVoices() {
		return this.voices
	}

	determineWhatToRead(element) {
		if (element.innerText) {
			this.readAloud(element.innerText)
		} else if (element.alt) {
			this.readAloud("An image with alt text reading: " + element.alt)
		} else if (element.title) {
			this.readAloud("An element with the title: " + element.title)
		} else if (element.ariaLabel) {
			this.readAloud("An element with the aria label: " + element.ariaLabel)
		} else if (element instanceof HTMLInputElement) {
			this.readAloud("An input element with the name: " + element.name)
		}
	}
}

const tool = new Click2ReadTool()
tool.init()