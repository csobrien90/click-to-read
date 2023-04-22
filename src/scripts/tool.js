const keysPressed = {}
let highlightedElement = null
let voices = []

window.addEventListener('mousemove', (e) => {
	if (keysPressed['q'] && keysPressed['w'] && keysPressed['e']) {
		const hoveredElement = document.elementFromPoint(e.clientX, e.clientY)
		if (highlightedElement !== hoveredElement) {
			hoveredElement.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'
			hoveredElement.addEventListener('mouseleave', () => {
				hoveredElement.style.backgroundColor = ''
			})
			if (highlightedElement) {
				highlightedElement.style.backgroundColor = 'initial'
				highlightedElement.removeEventListener('mouseleave', () => {
					highlightedElement.style.backgroundColor = ''
				})
			}
			highlightedElement = hoveredElement
		}
	}
});

window.addEventListener('keydown', (e) => {
	keysPressed[e.key] = true
})

window.addEventListener('keyup', (e) => {
	keysPressed[e.key] = false
})

window.addEventListener('click', (e) => {
	if (keysPressed['q'] && keysPressed['w']) {
		speak(e.target.innerText)
	}
});

async function speak(text) {
	if ('speechSynthesis' in window) {
		// Create an utterance object
		const synthesis = window.speechSynthesis;
		const utterance = new SpeechSynthesisUtterance(text);

		// Get voices
		if (voices.length === 0) {
			synthesis.onvoiceschanged = () => {voices = synthesis.getVoices()}
		}
	  
		// Set utterance properties
		chrome.storage.sync.get(['voice', 'rate', 'pitch', 'volume'], (options) => {
			utterance.rate = options.rate
			utterance.pitch = options.pitch
			utterance.volume = options.volume
			utterance.voice = voices.find(voice => voice.name === options.voice)

			// Speak the utterance
			synthesis.speak(utterance);
		})
	  
	} else {
		console.log('Text-to-speech not supported.');
	}
}