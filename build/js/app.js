import { barSearchBehavior, modalBehavior } from './modules/functions.js';

document.addEventListener('DOMContentLoaded', () => {
    const search_bar = document.getElementById('search_bar');
    barSearchBehavior(search_bar);

    const task_button = document.getElementById('task_button');
    const modal = document.getElementById('modal');
    const cancel_button = document.getElementById('cancel_button');
    modalBehavior(task_button, modal, cancel_button);
});