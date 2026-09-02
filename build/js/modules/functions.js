export default function barSearchBehavior(input) {
    input.addEventListener('keydown', preventDefaultFunction);
}

function preventDefaultFunction(event) {
    event.preventDefault();
}