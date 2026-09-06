import { default as loadData } from './data.js';

function addTask(task) {
    const data = loadData();

    data.push(task);

    
}