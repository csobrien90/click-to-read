// Get DOM elements
const hotkeyLabels = Array.from(document.querySelectorAll('#hotkeySettings label'))
const voiceSelect = document.querySelector('select[name="voice"]')
const rateInput = document.querySelector('input[name="rate"]')
const pitchInput = document.querySelector('input[name="pitch"]')
const volumeInput = document.querySelector('input[name="volume"]')
const highlightColorInput = document.querySelector('input[name="highlightColor"]')
const testVoiceButton = document.querySelector('#testVoice')
const restoreDefaultOptionsButton = document.querySelector('#restoreSettings')
const navButtons = Array.from(document.querySelectorAll('nav button'))

// Add event listeners to nav buttons
navButtons.forEach(button => {
	button.addEventListener('click', () => {
		// Remove active class from all buttons
		navButtons.forEach(button => button.classList.remove('active'))

		// Add active class to clicked button
		button.classList.add('active')

		// Hide all forms
		const forms = Array.from(document.querySelectorAll('form'))
		forms.forEach(form => form.classList.remove('active'))

		// Show form corresponding to clicked button
		const form = document.querySelector(`#${button.dataset.formid}`)
		form.classList.add('active')
	})
})

let voices = []

// Populate the voice select with available voices
window.speechSynthesis.onvoiceschanged = () => {
	// After voices have loaded, get the available voices
	voices = window.speechSynthesis.getVoices()

	// Populate voice dropdown
	voices.forEach(voice => {
		const option = document.createElement('option')
		option.value = voice.name
		option.innerText = `${voice.name} (${voice.lang})`
		voiceSelect.appendChild(option)
	})

	loadOptions()
	loadHotkeys()
	loadAppearanceOptions()
	customizeSelect()
}

// Listen for changes to hotkey inputs
hotkeyLabels.forEach(label => {
	label.addEventListener('click', () => {
		const input = label.querySelector('input')
		const previousHotkey = input.value
		input.value = ''

		window.addEventListener('keydown', (e) => {
			// Prevent default behavior of hotkey
			e.preventDefault()

			// Confirm hotkey is not already in use
			const hotkeys = hotkeyLabels.map(label => label.querySelector('input').value)
			if (hotkeys.includes(e.key)) {
				// Display error message
				const errorMessage = document.createElement('p')
				errorMessage.innerText = 'Hotkey already in use'
				errorMessage.style.color = 'red'
				label.appendChild(errorMessage)

				// Remove error message after 2 seconds
				setTimeout(() => {
					label.removeChild(errorMessage)
				}, 2000)

				// Restore previous hotkey
				input.value = previousHotkey
				return
			}

			saveHotkeys(input.name, e.key)
			input.value = e.key

			// Remove event listener
			window.removeEventListener('keydown', () => {})
		}, {once: true})
	})
})

// Listen for changes to options inputs
voiceSelect.addEventListener('change', saveOptions)
rateInput.addEventListener('change', saveOptions)
pitchInput.addEventListener('change', saveOptions)
volumeInput.addEventListener('change', saveOptions)
highlightColorInput.addEventListener('change', saveAppearanceOptions)

// Save options to chrome.storage
function saveOptions() {
	const options = {
		voice: voiceSelect.value,
		rate: rateInput.value,
		pitch: pitchInput.value,
		volume: volumeInput.value,
	}

	chrome.storage.sync.set(options, () => {
		console.info('Click2Read options saved')
	})

	displayRefreshNotice()
}

// Save appearance options to chrome.storage
function saveAppearanceOptions() {
	const options = {
		highlightColor: highlightColorInput.value
	}

	chrome.storage.sync.set(options, () => {
		console.info('Click2Read appearance options saved')
	})

	displayRefreshNotice()
}


// Save hotkeys to chrome.storage
function saveHotkeys(key, value) {
	chrome.storage.sync.set({[key]: value}, () => {
		console.info('Click2Read hotkeys saved')
	})
	
	displayRefreshNotice()
}

function displayRefreshNotice() {
	if (document.querySelector('#refresh-notice')) return

	// Create message to tell user to refresh page
	const message = document.createElement('p')
	message.id = "refresh-notice"
	message.innerText = 'Refresh to see changes'

	// Add event listener to refresh active tab when message is clicked
	message.addEventListener('click', () => {
		let queryOptions = { active: true };
		chrome.tabs.query(queryOptions).then((tabs) => chrome.tabs.reload(tabs[0].id));
		message.remove()
	})

	// Append message to DOM
	document.querySelector('#main-header').appendChild(message)
}

// Load options from chrome.storage and set inputs in DOM
function loadOptions() {
	chrome.storage.sync.get(['voice', 'rate', 'pitch', 'volume', 'highlightColor'], (options) => {
		voiceSelect.value = options.voice
		rateInput.value = options.rate
		pitchInput.value = options.pitch
		volumeInput.value = options.volume
	})
}

// Load appearance options from chrome.storage and set inputs in DOM
function loadAppearanceOptions() {
	chrome.storage.sync.get(['highlightColor'], (options) => {
		highlightColorInput.value = options.highlightColor
	})
}

// Load hotkeys from chrome.storage and set inputs in DOM
function loadHotkeys() {
	chrome.storage.sync.get(['hotkey1', 'hotkey2', 'hotkey3', 'hotkey4'], (hotkeys) => {
		hotkeyLabels.forEach(label => {
			const input = label.querySelector('input')
			input.value = hotkeys[input.name]
		})
	})
}

// Restore default options
restoreDefaultOptionsButton.addEventListener('click', restoreDefaultOptions)
function restoreDefaultOptions() {
	const defaultOptions = {
		voice: 'default',
		rate: 1,
		pitch: 1,
		volume: .6,
		highlightColor: '#00ff00'
	}

	chrome.storage.sync.set(defaultOptions, () => {
		console.info('Click2Read options restored')
		loadOptions()
		loadAppearanceOptions()
	})
}

// Customize select element
function customizeSelect() {
	voiceSelect.addEventListener('focus', () => {
		voiceSelect.size = 6
	})

	voiceSelect.addEventListener('blur', () => {
		voiceSelect.size = 1
	})

	voiceSelect.addEventListener('change', () => {
		voiceSelect.size = 1
	})
}

// Test voice
testVoiceButton.addEventListener('click', () => {
	const utterance = new SpeechSynthesisUtterance('This is a test of the click to read extension.')
	utterance.rate = rateInput.value
	utterance.pitch = pitchInput.value
	utterance.volume = volumeInput.value
	utterance.voice = voices.find(voice => voice.name === voiceSelect.value)
	window.speechSynthesis.speak(utterance)
})