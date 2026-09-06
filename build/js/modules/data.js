export default function () {
    const tasksData = localStorage.getItem('tasks');

    if (tasksData) {
        const jsonTasksData = JSON.parse(tasksData);
        return jsonTasksData;
    } else {
        const newData = [{
            titulo: 'Tarea nueva',
            descripcion: 'Esta tarea es nueva, y es la primera',
            categoria: 'Urgente',
            estado: 'Pendiente',
            fecha: '09-04-2026'
        },
        {
            titulo: 'Lavar ropa',
            descripcion: 'Hacerlo por la tarde. Y no olvidar que se debe lavar todas las prendas blancas por separado.',
            categoria: 'Normal',
            estado: 'Completada',
            fecha: '09-01-2026'
        },
        {
            titulo: 'Leer un libro',
            descripcion: 'Leer por la noche, antes de dormir, es necesario para reflexionar, además que es bien genial leer en silecio, y más si es la biblia, es bueno lo que viene de Dios.',
            categoria: 'Urgente',
            estado: 'Pendiente',
            fecha: '09-05-2026'
        },
        {
            titulo: 'Barrer habitación',
            descripcion: 'Barrer un poco, sacar el polvo y las telas de araña y ordenar las cosas.',
            categoria: 'Normal',
            estado: 'Pendiente',
            fecha: '09-06-2026'
        }
        ]
        const jsonTasksData = [...newData];
        localStorage.setItem('tasks', JSON.stringify(jsonTasksData));
        return jsonTasksData;
    }
}