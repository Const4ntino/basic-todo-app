export default function () {
    const tasksData = localStorage.getItem('tasks');

    if (tasksData) {
        const jsonTasksData = JSON.parse(tasksData);
        return jsonTasksData;
    } else {
        return [];
    }
}

export function loadFilters() {
    const filtersSelected = localStorage.getItem('filters');

    if (filtersSelected) {
        const jsonFiltersSelected = JSON.parse(filtersSelected);
        return jsonFiltersSelected;
    } else {
        return {};
    }
}