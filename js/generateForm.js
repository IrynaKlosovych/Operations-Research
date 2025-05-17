function generateForm() {
  let numVars = document.getElementById("numVars").value;
  let numConstraints = document.getElementById("numConstraints").value;
  let result = document.getElementById("result");
  result.innerHTML = "";
  let inputMessage = document.getElementById("inputMessage");
  inputMessage.textContent = "";

  const formToFill = document.getElementById('formToFill');
  formToFill.innerHTML = '';

  formToFill.innerHTML += `<h3>Цільова функція:</h3>`;
  for (let i = 0; i < numVars; i++) {
    let numeratorId = `z${i}_a`;

    formToFill.innerHTML += `<input type="number" id="${numeratorId}" value="0" step="1" checkValue> x<sub>${i + 1}</sub>`;
    if (i === numVars - 1) {
      formToFill.innerHTML += ` &rarr; 
    <select id="objective">
        <option value="max">Максимізація</option>
        <option value="min">Мінімізація</option>
    </select>`;
    } else {
      formToFill.innerHTML += ` + `;
    }
  }

  formToFill.innerHTML += `<h3>Обмеження:</h3><div>`;
  for (let i = 0; i < numConstraints; i++) {
    for (let j = 0; j < numVars; j++) {
      let numeratorId = `c${i}_${j}_a`;

      formToFill.innerHTML += `<input type="number" id="${numeratorId}" value="0" step="1" checkValue> x<sub>${j + 1}</sub>`;

      if (j < numVars - 1) {
        formToFill.innerHTML += ` + `;
      } else {
        formToFill.innerHTML += `
  <select id="op${i}">
    <option value="<=">&le;</option>
    <option value="=">=</option>
    <option value=">=">&ge;</option>
  </select>
<input type="number" id="b${i}_a" value="0" step="1"></br>`;
      }
    }
  }

  for (let i = 0; i < numVars; i++) {
    formToFill.innerHTML += ` x<sub>${i + 1}</sub>${i < numVars - 1 ? ',' : ' &ge; 0'}`;
  }

  formToFill.innerHTML += `<br><button onclick="solve()">Розв'язати</button>`;
}