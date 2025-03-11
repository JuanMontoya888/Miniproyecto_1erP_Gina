var tableBody = document.getElementById('scoreTable');
var registerArray = JSON.parse(localStorage.getItem('scores')) || []; //obtenemos la lista de todos los registros

registerArray.forEach((element, index)=> {
    const row = document.createElement('tr'); //por cada iteracion creamos una nueva fila con sus propiedades
    row.innerHTML = `
        <td>${index}</td>
        <td>${element.name}</td>
        <td>${element.score}</td>
    `; // Creamos un boton que eliminara el registro que fue introducido

    tableBody.appendChild(row);

});
