import { addTask, editTask, deleteTask, getTaskList, getTask } from './task.js';
import { getFilters, updateFilters } from './filters.js';

export default function loadDOM() {
    const header_time = document.getElementById('header_time');
    const header_date = document.getElementById('header_date');
    datetimeBehavior(header_time, header_date);

    const search_bar = document.getElementById('search_bar');
    barSearchBehavior(search_bar);

    const task_button = document.getElementById('task_button');
    const modal = document.getElementById('modal');
    const modal_title = document.getElementById('modal_title');
    const close_button = document.getElementById('close_button');
    const cancel_button = document.getElementById('cancel_button');
    const main_button = document.getElementById('main_button');
    modalBehavior(task_button, modal, modal_title, close_button, cancel_button, main_button);

    const category_filter = document.getElementById('category_filter');
    const state_filter = document.getElementById('state_filter');
    const date_filter = document.getElementById('date_filter');
    const selected_filters = document.getElementById('selected_filters');
    loadSelectedFilters(selected_filters, category_filter, state_filter, date_filter);

    loadFilterValues(); // cargar opciones seleccionadas en los filtros
    const filter_button = document.getElementById('filter_button');
    const filter_container = document.getElementById('filters_box');
    filtersBehavior(filter_button, filter_container, category_filter, state_filter, date_filter, selected_filters);

    loadTaskList(); // carga de lista de tareas respetando filtros
    // delegación de eventos para manipular los popover, listener de los botones de ver, editar y eliminar con sus dialog
    taskListBehavior();

    const form = document.getElementById('form_modal');
    formBehavior(form);
}

function datetimeBehavior(header_time, header_date) {
    const timeFormatter = new Intl.DateTimeFormat('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    const dateFormatter = new Intl.DateTimeFormat('es-PE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    let currentDate = null;
    let timerId = null;

    function updateDatetime() {
        const now = new Date();
        header_time.textContent = timeFormatter.format(now);

        const date = now.getDate();
        if (date !== currentDate) {
            const date_str = dateFormatter.format(now);
            header_date.textContent = date_str.charAt(0).toUpperCase() + date_str.slice(1);
            currentDate = date;
        }
    }

    function start() {
        if (!timerId) {
            updateDatetime();
            timerId = setInterval(updateDatetime, 1000);
        }
    }

    function stop() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stop();
        } else {
            start();
        }
    })

    start();
    return stop;
}

function barSearchBehavior(input) {
    input.addEventListener('keydown', preventDefaultFunction);  
}

function modalBehavior(open_button, modal, modal_title, close_button, cancel_button, main_button) {
    open_button.addEventListener('click', () => {
        if (open_button.id === "task_button") {
            modal.removeAttribute('data-task-id');
            modal.removeAttribute('data-task-date');
            modal_title.textContent = 'Crear una tarea';
            main_button.textContent = 'Agregar';
            cancel_button.textContent = 'Limpiar campos';
            const form = document.querySelector('#modal > form:first-of-type');
            form.reset();
        }
        if (open_button.id === "delete_button") {
            modal.setAttribute('data-task-id', '');
            const modal_p_content_2 = document.getElementById('modal_p_content_2')
            modal_title.textContent = 'Eliminar una tarea';
            modal_p_content_2.textContent = '¿Estás seguro(a) que deseas eliminar esta tarea?';
        }
        modal.showModal();
    });

    const popover = document.getElementById('menu_opciones');
    modal.addEventListener('cancel', (e) => {
        e.preventDefault();
        const popoverIsOpen = popover.matches(':popover-open');
        if (popoverIsOpen) {
            popover.hidePopover();
        }
        closeWithTransition(modal);
    });

    close_button.addEventListener('click', (e) => {
        e.preventDefault();
        closeWithTransition(modal);
    });

    cancel_button.addEventListener('click', (e) => {
        e.preventDefault();
        if (!modal.hasAttribute('data-task-id')) {
            const form = document.querySelector('#modal > form:first-of-type');
            form.reset();
            return;
        }
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

function loadFilterValues() {
    const category_filter = document.getElementById('category_filter');
    const state_filter = document.getElementById('state_filter');
    const date_filter = document.getElementById('date_filter');

    // filtros iniciales
    const filters = getFilters();

    if (Object.keys(filters).length === 0) {
        const defaultFilters = {
            categoria: 'all',
            estado: 'all',
            fecha: 'descendente',
        }
        updateFilters(defaultFilters);
    }

    // filtros actuales
    const currentfilters = getFilters();

    category_filter.value = currentfilters.categoria; // seleccionar valor inicial de cada select o actualizarlo
    state_filter.value = currentfilters.estado;
    date_filter.value = currentfilters.fecha;
}

function appendSelectedFilter(selected_filters, key, value, filter) {
    const selected_exists = document.getElementById(`${key}_selected`);

    if (value === 'all' && selected_exists || value == 'descendente' && selected_exists) { // si el valor es 'all', 'descendiente' y el filtro seleccionado existe, entonces se elimina
        selected_exists.remove();
        if (selected_filters.children.length === 0) {
            const clear_button = document.getElementById('clear_button');
            clear_button.remove();
        }
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

    if (selected_exists) { // si existe el filtro seleccionado entonces solo modificar su textContent
        const textFilter = document.querySelector(`#${selected_exists.id} p`);
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

        // eliminar botón de limpiar filtros si no hay filtros seleccionados
        if (selected_filters.children.length === 0) {
            const clear_button = document.getElementById('clear_button');
            clear_button.remove();
        }
    });

    filter_div.appendChild(filter_span);
    filter_div.appendChild(close_button);

    selected_filters.appendChild(filter_div);

    clearFiltersButtonHandling(selected_filters); // manipulación del botón de limpiar filtros
}

function clearFiltersButtonHandling(selected_filters) {
    // Manipulación del botón de limpiar filtros
    const clear_button_exists = document.getElementById('clear_button');
    if (clear_button_exists) return;
    const selected_filters_container = document.getElementById('selected_filters_container'); // su parent container

    const clear_button = document.createElement('BUTTON');
    clear_button.id = 'clear_button';
    clear_button.classList.add('default-button');
    clear_button.classList.add('clear-button');

    const button_description = document.createElement('SPAN');
    button_description.textContent = 'Limpiar filtros';
    clear_button.appendChild(button_description);
    insertSvgIcon(clear_button, 'broom');

    clear_button.addEventListener('click', function () {
        const defaultFilters = {
            categoria: 'all',
            estado: 'all',
            fecha: 'descendente',
        }
        updateFilters(defaultFilters);
        selected_filters.textContent = ''; // eliminar todos los selected filters de su contenedor
        clear_button.remove();
        loadFilterValues();
        loadTaskList();
    });

    selected_filters_container.appendChild(clear_button);
}

function filtersBehavior(filter_button, filter_container, category_filter, state_filter, date_filter, selected_filters) {
    filter_button.addEventListener('pointerdown', () => {
        filter_container.classList.toggle('open');
    });

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
    const taskList = getTaskList(); // cargar tareas de localstorage
    let tasks = taskList; // no muta a taskList

    // Carga de KPIs

    const task_counter = document.getElementById('task_counter');
    const today_task_counter = document.getElementById('today_task_counter');

    const dateFormatter = new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }); // formateador de fecha
    const today = new Date(); // fecha actual
    const today_formatted = dateFormatter.format(today);

    const task_count = tasks.reduce((acumulador, tarea) => {
        const estado = tarea.estado;
        const fecha = tarea.fecha;

        // Comparación de fecha con la fecha de hoy
        const task_date_formatted = dateFormatter.format(+fecha);
        const same_date = today_formatted === task_date_formatted;

        return {
            ...acumulador,
            [estado]: (acumulador[estado] || 0) + 1,
            contador_tareas: (acumulador.contador_tareas || 0) + (+same_date)
        }
    }, {});

    task_counter.textContent = `${task_count.pendiente + task_count.procesando} tareas por completar`;
    today_task_counter.textContent = `${task_count.contador_tareas} tareas para hoy`

    // Carga de lista de tareas

    const task_list = document.getElementById('task_list'); // contenedor de la lista de tareas

    const currentFilters = getFilters(); // cargar filtros actuales de localStorage

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

    task_list.textContent = ''; // limpiar lista de tareas

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

        const popoverButton = document.createElement('BUTTON');
        popoverButton.classList.add('default-button');
        popoverButton.setAttribute('data-menu-btn', ''); // se usa un atributo para evitar usar clases (es mejor dejar las clases para los estilos)
        popoverButton.setAttribute('data-task-id', task.id ?? '');
        popoverButton.textContent = '⋮';

        task_buttons.appendChild(popoverButton);

        task_div.appendChild(task_buttons);

        // agregar tarea a la lista de tareas
        task_list.appendChild(task_div);
    }
}

function taskListBehavior() {
    const popover = document.getElementById('menu_opciones');
    let currentButton = null;

    document.addEventListener('click', function (e) {
        const buttonFound = e.target.closest('[data-menu-btn]');
        if (!buttonFound) {
            if (!e.target.closest('#menu_opciones')) {
                popover.hidePopover();
            }
            return;
        }

        const popoverIsOpen = popover.matches(':popover-open');
        if (popoverIsOpen && currentButton === buttonFound) {
            popover.hidePopover();
            return;
        }

        currentButton = buttonFound;
        popover.dataset.taskId = currentButton.dataset.taskId;

        const r = currentButton.getBoundingClientRect();
        if (!popoverIsOpen) popover.showPopover();
        popover.style.margin = '0';
        popover.style.inset = 'auto';
        popover.style.top = `${r.bottom + 10}px`;
        popover.style.left = `${r.right - popover.offsetWidth}px`;
    });

    const view_button = document.getElementById('view_button');
    const modal_2 = document.getElementById('modal_2');
    const modal_title_2 = document.getElementById('modal_title_2');
    const modal_p_content_2 = document.getElementById('modal_p_content_2');
    const cancel_button_2 = document.getElementById('cancel_button_2');
    const close_button_2 = document.getElementById('close_button_2');
    const delete_button = document.getElementById('delete_button');
    const main_button_2 = document.getElementById('main_button_2');

    modalBehavior(delete_button, modal_2, modal_title_2, close_button_2, cancel_button_2, main_button_2);

    view_button.addEventListener('click', () => {
        modal_2.dataset.taskId = popover.dataset.taskId;

        const task = getTask(modal_2.dataset.taskId);
        modal_title_2.textContent = task.titulo;

        const dateMs = task.fecha; // formateo de la fecha
        const date = new Date(dateMs);
        const formatedDate = date.toLocaleDateString('es-PE');

        modal_p_content_2.innerHTML = `<b>Fecha:</b> ${formatedDate}<br>
        <b>Categoría:</b> ${task.categoria}<br>
        <b>Descripción:</b> ${task.descripcion || 'Sin descripción'}<br>
        <b>Estado:</b> ${task.estado}`;

        modal_2.showModal();
    });

    // Modal para eliminar
    modal_2.setAttribute('data-task-id', ''); // parchecito para que no cumpla una condición dentro del listener de cancel_button

    main_button_2.addEventListener('click', () => {
        deleteTask(popover.dataset.taskId);
        loadTaskList();
        closeWithTransition(modal_2);
    });

    // Modal reutilizado para editar
    const edit_button = document.getElementById('edit_button');
    const modal = document.getElementById('modal');
    const modal_title = document.getElementById('modal_title');
    const main_button = document.getElementById('main_button');
    const cancel_button = document.getElementById('cancel_button');
    const form = document.getElementById('form_modal');

    edit_button.addEventListener('click', function () {
        modal.dataset.taskId = popover.dataset.taskId;
        modal_title.textContent = 'Editar tarea';
        main_button.textContent = 'Editar';
        cancel_button.textContent = 'Cancelar';

        const task = getTask(modal.dataset.taskId); // obtener la tarea
        modal.dataset.taskDate = task.fecha;
        form.elements.titulo.value = task.titulo;
        form.elements.descripcion.value = task.descripcion;
        form.elements.categoria.value = task.categoria;
        form.elements.estado.value = task.estado;
        modal.showModal();
    });
}

function formBehavior(form) {
    const modal = document.getElementById('modal');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const datos = new FormData(form);
        if (modal.hasAttribute('data-task-id')) {
            editTask({
                id: modal.dataset.taskId,
                fecha: +modal.dataset.taskDate,
                titulo: datos.get('titulo'),
                descripcion: datos.get('descripcion'),
                categoria: datos.get('categoria'),
                estado: datos.get('estado')
            });
            loadTaskList(); // cargar lista de datos
            closeWithTransition(modal);
            form.reset(); // resetear campos del formulario
            return;
        }
        addTask({
            titulo: datos.get('titulo'),
            descripcion: datos.get('descripcion'),
            categoria: datos.get('categoria'),
            estado: datos.get('estado')
        });
        loadTaskList(); // cargar lista de datos
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

function insertSvgIcon(container, iconId) {
    container.insertAdjacentHTML('beforeend', `<svg class="icon"><use href="#${iconId}"></svg>`);
}