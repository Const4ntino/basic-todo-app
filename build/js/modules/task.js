import { default as loadData } from './data.js';

function addTask(task) {
    const data = loadData(); // cargando la lista de tareas de localStorage

    task.id = crypto.randomUUID();
    task.fecha = Date.now(); // el valor de la fecha en milisegundos desde el primero de enero de 1970

    const updatedData = JSON.stringify([...data, task]);
    localStorage.setItem('tasks', updatedData);
}

function editTask(task) {
    const data = loadData();

    const taskIndex = data.findIndex(element => element.id === task.id);
    console.log(`índice de la tarea: ${taskIndex}`);
    const updatedData = data.with(taskIndex, task);
    
    localStorage.setItem('tasks', JSON.stringify(updatedData));
}

function deleteTask(taskId) {
    const data = loadData();
    const updatedData = data.filter((task) => task.id !== taskId);

    localStorage.setItem('tasks', JSON.stringify(updatedData));
}

function getTaskList() {
    return loadData();
}

function getTask(taskId) {
    const data = loadData();

    const task = data.find(task => task.id === taskId);
    return task;
}

export { addTask, editTask, deleteTask, getTaskList, getTask };