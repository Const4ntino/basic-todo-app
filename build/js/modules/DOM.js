import loadData from './data.js';

export default function loadDOM() {
    const search_bar = document.getElementById('search_bar');
    barSearchBehavior(search_bar);

    const task_button = document.getElementById('task_button');
    const modal = document.getElementById('modal');
    const close_button = document.getElementById('close_button');
    const cancel_button = document.getElementById('cancel_button');
    modalBehavior(task_button, modal, close_button, cancel_button);

    const filter_button = document.getElementById('filter_button');
    const filter_container = document.querySelector('.filter-section>div');
    filterButtonBehavior(filter_button, filter_container);

    const task_list = document.getElementById('task_list');
    loadTaskList(task_list);
}

function barSearchBehavior(input) {
    input.addEventListener('keydown', preventDefaultFunction);
}

function modalBehavior(open_button, modal, close_button, cancel_button) {
    open_button.addEventListener('click', () => {
        modal.showModal();
    });

    modal.addEventListener('cancel', (e) => {
        e.preventDefault();
        closeWithTransition(modal);
    })

    close_button.addEventListener('click', (e) => {
        e.preventDefault();
        closeWithTransition(modal);
    });

    cancel_button.addEventListener('click', (e) => {
        e.preventDefault();
        closeWithTransition(modal);
    });

}

function filterButtonBehavior(filter_button, filter_container) {
    filter_button.addEventListener('pointerdown', () => {
        filter_container.classList.toggle('open');
    });
}

function loadTaskList(task_list) {
    const tasks = loadData(); // cargar tareas de localstorage

    for (const task of tasks) {
        const task_div = document.createElement('ARTICLE');
        task_div.classList.add('task');

        // task-content
        const task_content = document.createElement('DIV');
        task_content.classList.add('task-content');

        const div_1 = document.createElement('DIV');

        const fecha = document.createElement('SPAN');
        fecha.classList.add('fecha');
        fecha.textContent = task.fecha;
        div_1.appendChild(fecha);

        const categoria = document.createElement('SPAN');
        const categoryClass = task.categoria.toLowerCase() === 'urgente' ? 'urgente' : 'normal';
        categoria.classList.add(categoryClass);
        categoria.textContent = categoryClass;
        div_1.appendChild(categoria);

        const div_2 = document.createElement('DIV');

        const titulo = document.createElement('P');
        titulo.classList.add('task-title');
        titulo.textContent = task.titulo;
        div_2.appendChild(titulo);

        const descripcion = document.createElement('P');
        descripcion.classList.add('task-description');
        descripcion.textContent = task.descripcion;
        div_2.appendChild(descripcion);

        task_content.appendChild(div_1);
        task_content.appendChild(div_2);
        task_div.appendChild(task_content);

        // task-buttons
        const task_buttons = document.createElement('DIV');
        task_buttons.classList.add('task-buttons');

        const viewButton = document.createElement('BUTTON');
        viewButton.classList.add('default-button');
        viewButton.textContent = 'Ver';
        task_buttons.appendChild(viewButton);
        const editButton = document.createElement('BUTTON');
        editButton.classList.add('default-button');
        editButton.textContent = 'Editar';
        task_buttons.appendChild(editButton);
        const deleteButton = document.createElement('BUTTON');
        deleteButton.classList.add('default-button');
        deleteButton.textContent = 'Eliminar';
        task_buttons.appendChild(deleteButton);

        task_div.appendChild(task_buttons);

        // agregar tarea a la lista de tareas
        task_list.appendChild(task_div);
    }
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