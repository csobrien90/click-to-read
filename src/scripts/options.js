// Get DOM elements
const hotkeyLabels = Array.from(document.querySelectorAll('#hotkeySettings label'))
const voiceSelect = document.querySelector('select[name="voice"]')
const rateInput = document.querySelector('input[name="rate"]')
const pitchInput = document.querySelector('input[name="pitch"]')
const volumeInput = document.querySelector('input[name="volume"]')
const testVoiceButton = document.querySelector('#testVoice')
const restoreDefaultOptionsButton = document.querySelector('#restoreSettings')

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

// Save options to chrome.storage
function saveOptions() {
	const options = {
		voice: voiceSelect.value,
		rate: rateInput.value,
		pitch: pitchInput.value,
		volume: volumeInput.value
	}
	chrome.storage.sync.set(options, () => {
		console.log('Options saved')
	})
}

// Save hotkeys to chrome.storage
function saveHotkeys(key, value) {
	chrome.storage.sync.set({[key]: value}, () => {
		console.log('Hotkeys saved')
	})
}

// Load options from chrome.storage and set inputs in DOM
function loadOptions() {
	chrome.storage.sync.get(['voice', 'rate', 'pitch', 'volume'], (options) => {
		voiceSelect.value = options.voice
		rateInput.value = options.rate
		pitchInput.value = options.pitch
		volumeInput.value = options.volume
	})
}

// Load hotkeys from chrome.storage and set inputs in DOM
function loadHotkeys() {
	chrome.storage.sync.get(['hotkey1', 'hotkey2', 'hotkey3', 'hotkey4'], (hotkeys) => {
		console.log(hotkeys)
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
		rate: 2,
		pitch: 1.5,
		volume: .8
	}

	chrome.storage.sync.set(defaultOptions, () => {
		console.log('Options restored')
		loadOptions()
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