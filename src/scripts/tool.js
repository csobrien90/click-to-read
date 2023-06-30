class Click2ReadTool {
	constructor() {
		this.keysPressed = {}
		this.highlightedElement = null
		this.highlightColor = ''
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

		// Get stored highlight color
		chrome.storage.sync.get(['highlightColor'], (options) => {
			this.highlightColor = options.highlightColor + 'bb' || '#00ff00bb'
		})

		/*
		---------------------------
		|     Event Listeners     |
		---------------------------
		*/

		// On mouse move, if hotkeys are pressed, highlight hovered element
		window.addEventListener('mousemove', (e) => {
			if (!this.keysPressed[this.hotkeys['hotkey1']] || !this.keysPressed[this.hotkeys['hotkey2']] || !this.keysPressed[this.hotkeys['hotkey3']]) return
			
			const hoveredElement = e.target
			if (!hoveredElement) return

			if (this.highlightedElement !== hoveredElement) {
				// Store original background color to restore on mouse leave
				let originalBackgroundColor
				if (hoveredElement.style.backgroundColor && hoveredElement.style.backgroundColor !== this.convertHexToRgbA(this.highlightColor)) {
					originalBackgroundColor = hoveredElement.style.backgroundColor
				} else {
					originalBackgroundColor = ''
				}

				// Highlight hovered element
				hoveredElement.style.backgroundColor = this.highlightColor

				// Restore original background color on mouse leave
				hoveredElement.addEventListener('mouseout', () => {
					hoveredElement.style.backgroundColor = originalBackgroundColor
				}, { once: true })

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

		// Track released keys
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
					children.forEach(child => {
						this.readAloud(this.determineWhatToRead(child))
					})
				} else {
					// If clicked element has no children, read it
					this.readAloud(this.determineWhatToRead(e.target))
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

		// Continue reading long text - this is a known workaround for a bug in Chrome
		let r = setInterval(() => {
			if (!speechSynthesis.speaking) {
				clearInterval(r);
			} else {
				speechSynthesis.pause();
				speechSynthesis.resume();
			}
		}, 14000);
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
				console.error('Text-to-speech not supported.');
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
					console.info('Click2Read hotkeys set to default')
				})
			} else if (
				storedKeys.hasOwnProperty('hotkey1') && 
				storedKeys.hasOwnProperty('hotkey2') && 
				storedKeys.hasOwnProperty('hotkey3') && 
				storedKeys.hasOwnProperty('hotkey4')) {
					this.setHotkeys(storedKeys)
			} else {
				chrome.storage.sync.set(defaultHotkeys, () => {
					console.info('Click2Read hotkeys set to default')
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
			return element.innerText
		} else if (element.alt) {
			return "An image with alt text reading: " + element.alt
		} else if (element.title) {
			return "An element with the title: " + element.title
		} else if (element.ariaLabel) {
			return "An element with the aria label: " + element.ariaLabel
		} else if (element instanceof HTMLInputElement) {
			return "An input element with the name: " + element.name
		} else {
			return ""
		}
	}

	convertHexToRgbA(hexVal) {
		var ret;
		  
		// If the hex value is valid.
		if(/^#([A-Fa-f0-9]{8})$/.test(hexVal)) {
			ret = hexVal.slice(1);

			// Convert the hex value to an array of decimal values.
			ret = ret.match(/.{2}/g);
			ret.pop();
			ret = ret.map(function(hex) {
				return parseInt(hex, 16);
			});

			// Add the alpha value
			ret.push(0.733);

			return 'rgba(' + ret.join(', ') + ')';
		}
	}
}

const tool = new Click2ReadTool()
tool.init()