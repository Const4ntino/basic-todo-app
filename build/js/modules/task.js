import { default as loadData } from './data.js';

function addTask(task) {
    const data = loadData(); // cargando la lista de tareas de localStorage

    task.id = crypto.randomUUID();
    task.fecha = Date.now(); // el valor de la fecha en milisegundos desde el primero de enero de 1970

    const updatedData = JSON.stringify([...data, task]);
    localStorage.setItem('tasks', updatedData);
}

function deleteTask(taskId) {
    const data = loadData();
    const updatedData = data.filter((task) => task.id !== taskId);
    
    localStorage.setItem('tasks', JSON.stringify(updatedData));
    console.log('Task ID: ', taskId);
}

function getTaskList() {
    return loadData();
}

export { addTask, deleteTask, getTaskList };