import { default as loadData } from './data.js';

function addTask(task) {
    const data = loadData(); // cargando la lista de tareas de localStorage
    task.fecha = Date.now(); // el valor de la fecha en milisegundos desde el primero de enero de 1970

    const updatedData = JSON.stringify([...data, task]);
    localStorage.setItem('tasks', updatedData);
}

function getTaskList() {
    return loadData();
}

export { addTask, getTaskList };