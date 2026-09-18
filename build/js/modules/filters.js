import { loadFilters } from './data.js';

function getFilters() {
    return loadFilters();
}

function updateFilters(filters) {
    localStorage.setItem('filters', JSON.stringify(filters));
}

export { getFilters, updateFilters };