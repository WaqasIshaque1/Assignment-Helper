import {
    addFontFromFile,
    formatText,
    addPaperFromFile
} from './utils/helpers.mjs';
import {
    generateImages,
    downloadAsPDF,
    deleteAll
} from './generate-images.mjs';
import { setInkColor, toggleDrawCanvas } from './utils/draw.mjs';
const pageEl = document.querySelector('.page-a');

const setTextareaStyle = (attrib, v) => (pageEl.style[attrib] = v);

/**
 * Add event listeners here, they will be automatically mapped with addEventListener later
 */
const EVENT_MAP = {
    '#heading-scale': {
        on: 'change',
        action: (e) => {
            document.documentElement.style.setProperty(
                '--heading-scale',
                e.target.value
            );
        }
    },
    '.heading-button': {
        on: 'click',
        action: (e) => {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                // Remove existing heading classes
                let parent = range.commonAncestorContainer;
                while (parent && parent !== document) {
                    if (parent.classList && parent.classList.contains('heading')) {
                        parent.classList.remove('h1', 'h2', 'h3');
                        parent = parent.parentNode;
                        break;
                    }
                    parent = parent.parentNode;
                }

                // Apply new heading
                const heading = document.createElement('span');
                heading.className = `heading ${e.target.dataset.heading}`;
                try {
                    range.surroundContents(heading);
                } catch (error) {
                    // If selection is invalid, wrap the text in a new span
                    const text = range.toString();
                    const textNode = document.createTextNode(text);
                    heading.appendChild(textNode);
                    range.deleteContents();
                    range.insertNode(heading);
                }
            }
        }
    },
    '#generate-image-form': {
        on: 'submit',
        action: (e) => {
            e.preventDefault();
            generateImages();
        }
    },
    '#handwriting-font': {
        on: 'change',
        action: (e) =>
            document.body.style.setProperty('--handwriting-font', e.target.value)
    },
    '#font-size': {
        on: 'change',
        action: (e) => {
            if (e.target.value > 30) {
                alert('Font-size is too big try upto 30');
            } else {
                setTextareaStyle('fontSize', e.target.value + 'pt');
                e.preventDefault();
            }
        }
    },
    '#letter-spacing': {
        on: 'change',
        action: (e) => {
            if (e.target.value > 40) {
                alert('Letter Spacing is too big try a number upto 40');
            } else {
                setTextareaStyle('letterSpacing', e.target.value + 'px');
                e.preventDefault();
            }
        }
    },
    '#word-spacing': {
        on: 'change',
        action: (e) => {
            if (e.target.value > 100) {
                alert('Word Spacing is too big try a number upto hundred');
            } else {
                setTextareaStyle('wordSpacing', e.target.value + 'px');
                e.preventDefault();
            }
        }
    },
    '#top-padding': {
        on: 'change',
        action: (e) => {
            document.querySelector('.page-a .paper-content').style.paddingTop =
                e.target.value + 'px';
        }
    },
    '#font-file': {
        on: 'change',
        action: (e) => addFontFromFile(e.target.files[0])
    },
    '#ink-color': {
        on: 'change',
        action: (e) => {
            document.body.style.setProperty('--ink-color', e.target.value);
            setInkColor(e.target.value);
        }
    },
    '#paper-margin-toggle': {
        on: 'change',
        action: () => {
            if (pageEl.classList.contains('margined')) {
                pageEl.classList.remove('margined');
            } else {
                pageEl.classList.add('margined');
            }
        }
    },
    '#paper-line-toggle': {
        on: 'change',
        action: () => {
            if (pageEl.classList.contains('lines')) {
                pageEl.classList.remove('lines');
            } else {
                pageEl.classList.add('lines');
            }
        }
    },
    '#draw-diagram-button': {
        on: 'click',
        action: () => {
            toggleDrawCanvas();
        }
    },
    '.draw-container .close-button': {
        on: 'click',
        action: () => {
            toggleDrawCanvas();
        }
    },
    '#download-as-pdf-button': {
        on: 'click',
        action: () => {
            downloadAsPDF();
        }
    },
    '#delete-all-button': {
        on: 'click',
        action: () => {
            deleteAll();
        }
    },
    '.page-a .paper-content': {
        on: 'paste',
        action: formatText
    },
    '#paper-file': {
        on: 'change',
        action: (e) => addPaperFromFile(e.target.files[0])
    },
    '#paraphrase-button': {
        on: 'click',
        action: async(e) => {
            const button = e.target;
            const input = document.getElementById('paraphraser-input');
            const output = document.getElementById('paraphraser-output');

            if (!input.value.trim()) {
                alert('Please enter text to paraphrase');
                return;
            }

            button.disabled = true;
            button.textContent = 'Paraphrasing...';

            try {
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer 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` // Replace with your API key
                    },
                    body: JSON.stringify({
                        model: 'deepseek/deepseek-chat:free',
                        messages: [{
                            role: 'user',
                            content: `Please rewrite the following text while maintaining its core meaning, ensuring the output is natural, fluent, and human-like. Use varied sentence structures and vocabulary where appropriate, while preserving the original intent and key information: ${input.value}`
                        }]
                    })
                });

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const data = await response.json();
                output.textContent = data.choices[0].message.content;
            } catch (error) {
                console.error('Paraphrase error:', error);
                alert('Failed to paraphrase text. Please try again.');
            } finally {
                button.disabled = false;
                button.textContent = 'Paraphrase';
            }
        }
    }
};

for (const eventSelector in EVENT_MAP) {
    document
        .querySelector(eventSelector)
        .addEventListener(
            EVENT_MAP[eventSelector].on,
            EVENT_MAP[eventSelector].action
        );
}
document.querySelectorAll('.switch-toggle input').forEach((toggleInput) => {
    toggleInput.addEventListener('change', (e) => {
        if (toggleInput.checked) {
            document.querySelector(
                `label[for="${toggleInput.id}"] .status`
            ).textContent = 'on';
            toggleInput.setAttribute('aria-checked', true);
        } else {
            toggleInput.setAttribute('aria-checked', false);
            document.querySelector(
                `label[for="${toggleInput.id}"] .status`
            ).textContent = 'off';
        }
    });
});