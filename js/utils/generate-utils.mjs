const pageEl = document.querySelector('.page-a');
const paperContentEl = document.querySelector('.page-a .paper-content');
const overlayEl = document.querySelector('.overlay');

let paperContentPadding;

function isFontErrory() {
    // Some fonts have padding top errors, this function tells you if the current font has that
    const currentHandwritingFont = document.body.style.getPropertyValue(
        '--handwriting-font'
    );
    return (
        currentHandwritingFont === '' ||
        currentHandwritingFont.includes('Homemade Apple')
    );
}

function applyPaperStyles() {
    const pageEffects = document.querySelector('#page-effects').value;

    // Common styles
    pageEl.style.border = 'none';
    pageEl.style.overflowY = 'hidden';

    if (pageEffects === 'scanner') {
        // Scanner effect
        const angle = Math.floor(Math.random() * (120 - 50 + 1)) + 50;
        overlayEl.style.background = `linear-gradient(${angle}deg, #0008, #0000)`;
        overlayEl.classList.add('shadows');
    } else if (pageEffects === 'shadows') {
        // Shadow effect
        const angle = Math.random() * 360;
        overlayEl.style.background = `linear-gradient(${angle}deg, #0008, #0000)`;
        overlayEl.classList.add('shadows');
    } else {
        overlayEl.classList.remove('shadows');
    }

    if (isFontErrory() && document.querySelector('#font-file').files.length < 1) {
        paperContentPadding =
            paperContentEl.style.paddingTop.replace(/px/g, '') || 5;
        const newPadding = Number(paperContentPadding) - 5;
        paperContentEl.style.paddingTop = `${newPadding}px`;
    }
}

function removePaperStyles() {
    pageEl.style.overflowY = 'auto';
    pageEl.style.border = '1px solid var(--elevation-background)';

    if (document.querySelector('#page-effects').value === 'scanner') {
        overlayEl.classList.remove('shadows');
    } else {
        overlayEl.classList.remove(document.querySelector('#page-effects').value);
    }

    if (isFontErrory()) {
        paperContentEl.style.paddingTop = `${paperContentPadding}px`;
    }
}

function renderOutput(outputImages) {
    if (outputImages.length <= 0) {
        document.querySelector('#output').innerHTML =
            'Click "Generate Image" Button to generate new image.';
        document.querySelector('#download-as-pdf-button').classList.remove('show');
        document.querySelector('#delete-all-button').classList.remove('show');
        return;
    }

    document.querySelector('#download-as-pdf-button').classList.add('show');
    document.querySelector('#delete-all-button').classList.add('show');
    document.querySelector('#output').innerHTML = outputImages
        .map(
            (outputImageCanvas, index) => /* html */ `
    <div 
      class="output-image-container" 
      style="position: relative;display: inline-block;"
    >
      <button 
        data-index="${index}" 
        class="close-button close-${index}">
          &times;
      </button>
      <img 
        class="shadow" 
        alt="Output image ${index}" 
        src="${outputImageCanvas.toDataURL('image/jpeg')}"
      />
      <div style="text-align: center">
        <a 
          class="button download-image-button" 
          download 
          href="${outputImageCanvas.toDataURL('image/jpeg')}
        ">Download Image</a>
        <br/>
        <br/>

        <button 
          class="button move-left"
          data-index="${index}" 
        >
          Move Left
        </button>
        <button 
          class="button move-right"
          data-index="${index}" 
        >
          Move Right
        </button>
      </div>
    </div>
    `
        )
        .join('');
}

export { removePaperStyles, applyPaperStyles, renderOutput };