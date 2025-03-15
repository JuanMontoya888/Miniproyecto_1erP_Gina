var tableBody = document.getElementById('scoreTable');
var registerArray = JSON.parse(localStorage.getItem('scores')) || []; //obtenemos la lista de todos los registros

if (registerArray.length > 0) {
    registerArray.sort((a, b) => b.score - a.score);
}

registerArray.forEach((element, index) => {
    const row = document.createElement('tr'); //por cada iteración creamos una nueva fila con sus propiedades
    row.innerHTML = `
        <td>${index + 1}</td> <!-- Mostrar un índice de 1 a N -->
        <td>${element.name}</td>
        <td>${element.score}</td>
        <td>${element.fecha}</td>        
    `;

    tableBody.appendChild(row);
});
