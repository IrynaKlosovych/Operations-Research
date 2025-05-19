function solve() {

    let inputMessage = document.getElementById("inputMessage");
    let numVars = parseInt(document.getElementById("numVars").value);
    let numConstraints = parseInt(document.getElementById("numConstraints").value);
    let result = document.getElementById("result");
    result.innerHTML = "";
    inputMessage.textContent = "";



    let isAllInteger = checkInteger();
    if (!isAllInteger) {
        inputMessage.textContent = "Не всі значення є цілими";
        return;
    }
    inputMessage.textContent = "";



    let objectiveCoeffs = [];
    for (let i = 0; i < numVars; i++) {
        let coeff = parseFloat(document.getElementById(`z${i}_a`).value);
        objectiveCoeffs.push(coeff);

    }

    let objectiveType = document.getElementById("objective").value;

    let objective = { objectiveCoeffs: objectiveCoeffs, objectiveType: objectiveType };
    let constraints = [];
    for (let i = 0; i < numConstraints; i++) {
        let coeffs = [];
        for (let j = 0; j < numVars; j++) {
            let val = parseFloat(document.getElementById(`c${i}_${j}_a`).value);
            coeffs.push(val);
        }

        let op = document.getElementById(`op${i}`).value;
        let b = parseFloat(document.getElementById(`b${i}_a`).value);

        constraints.push({
            coefficients: coeffs,
            operator: op,
            value: b
        });
    }


    constraints = toCanonicalForm(constraints);

    let simplex = new SimplexSolver(objective, constraints);
    result.innerHTML += generateSystemInequation(simplex);



    simplex = generateBase(simplex);


    result.innerHTML += generateSystemEquation(simplex);
    result?.appendChild(generateBaseTable(simplex));


    result.appendChild(simplexCount(simplex));
}