// Get DOM elements
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
}

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

// Load options from chrome.storage and set inputs in DOM
function loadOptions() {
	chrome.storage.sync.get(['voice', 'rate', 'pitch', 'volume'], (options) => {
		voiceSelect.value = options.voice
		rateInput.value = options.rate
		pitchInput.value = options.pitch
		volumeInput.value = options.volume
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