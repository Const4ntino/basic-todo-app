export function barSearchBehavior(input) {
    input.addEventListener('keydown', preventDefaultFunction);
}

export function modalBehavior(open_button, modal, cancel_button) {
    open_button.addEventListener('click', () => {
        modal.showModal();
    });

    cancel_button.addEventListener('click', () => {
        modal.close();
    });
}


// Utilities functions

function preventDefaultFunction(event) {
    event.preventDefault();
}