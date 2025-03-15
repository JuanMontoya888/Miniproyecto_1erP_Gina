var tableBody = document.getElementById('scoreTable');
var registerArray = JSON.parse(localStorage.getItem('scores')) || []; //obtenemos la lista de todos los registros

registerArray.forEach((element, index)=> {
    const row = document.createElement('tr'); //por cada iteracion creamos una nueva fila con sus propiedades
    row.innerHTML = `
        <td>${index+1}</td>
        <td>${element.name}</td>
        <td>${element.score}</td>
    `;

    tableBody.appendChild(row);

});

tableBody.addEventListener('dblclick', (event)=>{
    tr_label = event.target.parentNode;

    var nombre;
    nombre = tr_label.children[1].textContent;
    localStorage.setItem('nombre', JSON.stringify(nombre));

    location.href = 'selectPer.html';
});

