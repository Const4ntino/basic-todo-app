export function barSearchBehavior(input) {
    input.addEventListener('keydown', preventDefaultFunction);
}

export function modalBehavior(open_button, modal, cancel_button) {
    open_button.addEventListener('click', () => {
        modal.showModal();
    });

    cancel_button.addEventListener('click', (e) => {
        e.preventDefault();
        closeWithTransition(modal);
    });

    modal.addEventListener('cancel', (e) => {
        e.preventDefault();
        closeWithTransition(modal);
    })
}

export function filterButtonBehavior(filter_button, filter_container) {
    filter_button.addEventListener('pointerdown', () => {
        filter_container.classList.toggle('open');
    });
}

// Utilities functions

function preventDefaultFunction(event) {
    event.preventDefault();
}

function closeWithTransition(modal) {
    modal.classList.add('closing');
    modal.addEventListener('transitionend', () => {
        modal.classList.remove('closing');
        modal.close();
    }, { once: true });
}