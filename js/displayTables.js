function generateBaseTable(simplex) {
    let table = document.createElement("table");
    let fisrtTr = document.createElement("tr");
    let C = document.createElement("td");
    C.innerHTML = "C";
    fisrtTr.appendChild(C);
    let BaseColumn = document.createElement("td");
    BaseColumn.innerHTML = "-";
    fisrtTr.appendChild(BaseColumn);
    let secondTr = document.createElement("tr");
    let B = document.createElement("td");
    B.innerHTML = "B";
    secondTr.appendChild(B);
    for (let i = 0; i <= simplex.table.objRow.length; i++) {
        if (i !== simplex.table.objRow.length)
            for (const key in simplex.table.objRow[i]) {
                let td = document.createElement("td");
                td.innerHTML += displayObjective(simplex.table.objRow[i][key], true);
                fisrtTr.appendChild(td);
            }
        let secondRowTd = document.createElement("td");
        secondRowTd.innerHTML = `A<sub>${i}</sub>`;
        secondTr.appendChild(secondRowTd);
    }

    table.appendChild(fisrtTr);
    table.appendChild(secondTr);


    for (let h = 0; h < simplex.constraints.length; h++) {
        let constRow = document.createElement("tr");
        let keyTd = document.createElement("td");
        let key = Object.keys(simplex.table.A0Column[h])[0];;
        keyTd.innerHTML = key;
        constRow.appendChild(keyTd);
        let A0_key = simplex.table.A0Column[h][key];
        let A0Td = document.createElement("td");
        A0Td.innerHTML = A0_key;
        constRow.appendChild(A0Td);

        for (let i = 0; i < simplex.varCount; i++) {
            for (const key in simplex.table.varsRows[h][i]) {
                {
                    let td = document.createElement("td");
                    td.innerHTML += displayFraction(simplex.table.varsRows[h][i][key], true);
                    constRow.appendChild(td);
                }
            }
        }

        for (let i = 0; i < simplex.slackVarsCount; i++) {

            for (const key in simplex.table.slackRows[h][i]) {
                {
                    let td = document.createElement("td");
                    td.innerHTML += displayFraction(simplex.table.slackRows[h][i][key], true);
                    constRow.appendChild(td);
                }
            }
        }

        for (let i = 0; i < simplex.artificialVarsCount; i++) {
            for (const key in simplex.table.artificialRows[h][i]) {
                {
                    let td = document.createElement("td");
                    td.innerHTML += displayFraction(simplex.table.artificialRows[h][i][key], true);
                    constRow.appendChild(td);
                }
            }
        }
        table.appendChild(constRow);
    }
    let deltaTr = document.createElement("tr");
    let deltaTd = document.createElement("td");
    deltaTd.innerHTML = "&#916;";
    deltaTr.appendChild(deltaTd);

    simplex = countDelta(simplex);

    simplex.delta.forEach(elem => {
        let td = document.createElement('td');
        td.innerHTML = elem;
        deltaTr.appendChild(td);
    });

    table.appendChild(deltaTr);
    return table;
}





// function generateMidTable(simplex) {

// }

// function generateResTable(simplex) {

// }

