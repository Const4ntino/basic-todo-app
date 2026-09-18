import { addTask, getTaskList } from './task.js';
import { getFilters, updateFilters } from './filters.js';

export default function loadDOM() {
    const search_bar = document.getElementById('search_bar');
    barSearchBehavior(search_bar);

    const task_button = document.getElementById('task_button');
    const modal = document.getElementById('modal');
    const close_button = document.getElementById('close_button');
    const cancel_button = document.getElementById('cancel_button');
    modalBehavior(task_button, modal, close_button, cancel_button);

    const category_filter = document.getElementById('category_filter');
    const state_filter = document.getElementById('state_filter');
    const date_filter = document.getElementById('date_filter');
    const selected_filters = document.getElementById('selected_filters');
    loadSelectedFilters(selected_filters, category_filter, state_filter, date_filter);

    const filter_button = document.getElementById('filter_button');
    const filter_container = document.getElementById('filters_box');
    filtersBehavior(filter_button, filter_container, category_filter, state_filter, date_filter, selected_filters);

    loadTaskList(); // carga de lista de tareas respectando filtros

    const form = document.getElementById('form_modal');
    formBehavior(form, task_list);
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

function loadSelectedFilters(selected_filters, category_filter, state_filter, date_filter) {
    const filters = getFilters(); // filtros actuales
    if (Object.keys(filters).length === 0) return;

    if (filters.categoria !== 'all') {

        appendSelectedFilter(selected_filters, 'categoria', filters.categoria, category_filter);
    }

    if (filters.estado !== 'all') {
        appendSelectedFilter(selected_filters, 'estado', filters.estado, state_filter);
    }

    if (filters.fecha !== 'descendente') {
        appendSelectedFilter(selected_filters, 'fecha', filters.fecha, date_filter);
    }
}

function appendSelectedFilter(selected_filters, key, value, filter) {
    const selected_exist = document.getElementById(`${key}_selected`);

    if (value === 'all' && selected_exist || value == 'descendente' && selected_exist) { // si el valor es 'all', 'descendiente' y el filtro seleccionado existe, entonces se elimina
        selected_exist.remove();
        return;
    }

    const mapped_values = new Map();
    mapped_values.set('urgente', 'Urgente');
    mapped_values.set('normal', 'Normal');
    mapped_values.set('pendiente', 'Pendientes');
    mapped_values.set('procesando', 'En proceso');
    mapped_values.set('completada', 'Completadas');
    mapped_values.set('ascendente', 'Ascendente');

    value = mapped_values.get(value);

    if (selected_exist) { // si existe el filtro seleccionado entonces solo modificar su textContent
        const textFilter = document.querySelector(`#${selected_exist.id} p`);
        textFilter.textContent = `${key[0].toUpperCase() + key.substring(1)}: ${value}`;
        return;
    }

    const filter_div = document.createElement('ARTICLE'); // es el contenedor del filtro seleccionado
    filter_div.classList.add('selected-filter');
    filter_div.id = `${key}_selected`;

    const filter_span = document.createElement('P');
    filter_span.textContent = `${key[0].toUpperCase() + key.substring(1)}: ${value}`;

    const close_button = document.createElement('BUTTON');
    close_button.ariaLabel = 'Cerrar';
    close_button.textContent = '×';
    close_button.addEventListener('click', () => {
        const currentFilters = getFilters();
        const updatedFilters = {
            ...currentFilters,
            [key]: (key === 'fecha') ? 'descendente' : 'all'
        };
        updateFilters(updatedFilters);
        filter_div.remove();
        filter.value = (key === 'fecha') ? 'descendente' : 'all';
        loadTaskList();
    });

    filter_div.appendChild(filter_span);
    filter_div.appendChild(close_button);

    selected_filters.appendChild(filter_div);
}

function filtersBehavior(filter_button, filter_container, category_filter, state_filter, date_filter, selected_filters) {
    filter_button.addEventListener('pointerdown', () => {
        filter_container.classList.toggle('open');
    });

    // filtros iniciales
    const filters = getFilters();

    if (Object.keys(filters).length === 0) {
        const defaultFilters = {
            categoria: 'all',
            estado: 'all',
            fecha: 'descendente',
        }
        localStorage.setItem('filters', JSON.stringify(defaultFilters));
    }

    // filtros actuales
    const currentfilters = getFilters();

    category_filter.value = currentfilters.categoria; // seleccionar valor inicial de cada select
    state_filter.value = currentfilters.estado;
    date_filter.value = currentfilters.fecha;

    category_filter.addEventListener('change', () => {
        const filters = getFilters();
        const newFilters = {
            ...filters,
            categoria: category_filter.value
        }
        updateFilters(newFilters);
        appendSelectedFilter(selected_filters, 'categoria', category_filter.value, category_filter);
        loadTaskList();
    });

    state_filter.addEventListener('change', () => {
        const filters = getFilters();
        const newFilters = {
            ...filters,
            estado: state_filter.value
        }
        updateFilters(newFilters);
        appendSelectedFilter(selected_filters, 'estado', state_filter.value, state_filter);
        loadTaskList();
    });

    date_filter.addEventListener('change', () => {
        const filters = getFilters();
        const newFilters = {
            ...filters,
            fecha: date_filter.value
        }
        updateFilters(newFilters);
        appendSelectedFilter(selected_filters, 'fecha', date_filter.value, date_filter);
        loadTaskList();
    });
}

function loadTaskList() {
    const task_list = document.getElementById('task_list'); // contenedor de la lista de tareas

    const taskList = getTaskList(); // cargar tareas de localstorage
    const currentFilters = getFilters(); // cargar filtros actuales de localStorage

    let tasks = taskList; // no muta a taskList

    if (currentFilters.categoria !== 'all') {
        const taskFound = tasks.filter((task) => task.categoria === currentFilters.categoria);
        if (taskFound.length === 0) {
            task_list.textContent = '';
            return;
        } else {
            tasks = tasks.filter((task) => task.categoria === currentFilters.categoria);
        }
    }

    if (currentFilters.estado !== 'all') {
        const taskFound = tasks.filter((task) => task.estado === currentFilters.estado);
        if (taskFound.length === 0) {
            task_list.textContent = '';
            return;
        } else {
            tasks = tasks.filter((task) => task.estado === currentFilters.estado);
        }
    }

    if (currentFilters.fecha === 'descendente') {
        tasks = tasks.toSorted((a, b) => b.fecha - a.fecha);
    } else {
        tasks = tasks.toSorted((a, b) => a.fecha - b.fecha);
    }

    if (tasks.length > 0) task_list.textContent = ''; // limpiar lista de tareas

    for (const task of tasks) {
        const task_div = document.createElement('ARTICLE');
        task_div.classList.add('task');

        // task-content
        const task_content = document.createElement('DIV');
        task_content.classList.add('task-content');

        // Primer div de task-content: contiene fecha, categoría y estado de la tarea
        const div_1 = document.createElement('DIV');

        /* Gestión de fechas */
        const fecha = document.createElement('SPAN');
        fecha.classList.add('fecha');
        const dateMs = task.fecha; // obtenemos la fecha en su valor de milisegundos
        const date = new Date(dateMs);
        const formatedDate = date.toLocaleDateString('es-PE');
        fecha.textContent = formatedDate;

        div_1.appendChild(fecha);

        const categoria = document.createElement('SPAN');
        const categoryClass = task.categoria.toLowerCase() === 'urgente' ? 'Urgente' : 'Normal';
        categoria.classList.add(categoryClass.toLowerCase());
        categoria.textContent = categoryClass;
        div_1.appendChild(categoria);

        const estado = document.createElement('SPAN');
        const stateTask = task.estado.toLowerCase();
        let stateClass = '';
        switch (stateTask) {
            case 'pendiente':
                stateClass = 'Pendiente';
                break;
            case 'procesando':
                stateClass = 'En proceso';
                break;
            case 'completada':
                stateClass = 'Completada';
                break;
        }
        estado.classList.add(stateTask);
        estado.textContent = stateClass;
        div_1.appendChild(estado);

        // Segundo div de task-content: contiene el título y la descripción de la tarea
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

function formBehavior(form) {
    const modal = document.getElementById('modal');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const datos = new FormData(form);
        addTask({
            titulo: datos.get('titulo'),
            descripcion: datos.get('descripcion'),
            categoria: datos.get('categoria'),
            estado: datos.get('estado')
        });
        loadTaskList(task_list); // cargar lista de datos
        closeWithTransition(modal);
        form.reset(); // resetear campos del formulario
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