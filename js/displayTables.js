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
        let A0_key = displayFraction(simplex.table.A0Column[h][key], true);
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

function generateMidTable(simplex) {
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


    const oldVarsArray = deepCloneWithFractions(simplex.table.varsRows);
    const oldSlackArray = deepCloneWithFractions(simplex.table.slackRows);
    const oldArtificialArray = deepCloneWithFractions(simplex.table.artificialRows);
    const oldA0Column = cloneA0ColumnWithFractions(simplex.table.A0Column);

    for (let h = 0; h < simplex.constraints.length; h++) {
        let constRow = document.createElement("tr");
        let keyTd = document.createElement("td");
        let key = Object.keys(oldA0Column[h])[0];;
        keyTd.innerHTML = key;
        constRow.appendChild(keyTd);


        const rows1 = Array.isArray(oldVarsArray[h]) ? oldVarsArray[h] : [];
        const rows2 = Array.isArray(oldSlackArray[h]) ? oldSlackArray[h] : [];
        const rows3 = Array.isArray(oldArtificialArray[h]) ? oldArtificialArray[h] : [];

        const allArrays = [...rows1, ...rows2, ...rows3];

        const elementInPivotColumn = allArrays.find(obj => obj.hasOwnProperty(simplex.pivotCol.name))?.[simplex.pivotCol.name];


        console.log('elementInPivotColumn:', elementInPivotColumn);
        console.log('pivot value:', oldA0Column[simplex.pivotRow.index][simplex.pivotCol.name]);
        console.log('pivot element:', simplex.pivotElement);
        console.log('current value:', oldA0Column[h][key]);


        let A0_key;
        if (h !== simplex.pivotRow.index) {
            A0_key = `${displayFraction(oldA0Column[h][key], true)} - <math>
  <mfrac>
    <mrow>${displayFraction(elementInPivotColumn, true)}<mo>*</mo>${displayFraction(oldA0Column[simplex.pivotRow.index][simplex.pivotCol.name], true, true)}</mrow>
    <mrow><mo>${displayFraction(simplex.pivotElement, true, true)}</mo></mrow>
  </mfrac>
</math>`;
            simplex.table.A0Column[h][key] = math.subtract(oldA0Column[h][key], math.divide(math.multiply(elementInPivotColumn, oldA0Column[simplex.pivotRow.index][simplex.pivotCol.name]), simplex.pivotElement));
        } else {
            A0_key = `${displayFraction(oldA0Column[h][key], true)} <mo>:</mo> ${displayFraction(simplex.pivotElement, true, true)}`;
            simplex.table.A0Column[h][key] = math.divide(oldA0Column[h][key], simplex.pivotElement);
        }

        let A0Td = document.createElement("td");
        A0Td.innerHTML = A0_key;
        constRow.appendChild(A0Td);

        for (let i = 0; i < simplex.varCount; i++) {
            for (const key in simplex.table.varsRows[h][i]) {
                {
                    let td = document.createElement("td");
                    if (h !== simplex.pivotRow.index) {
                        td.innerHTML = `${displayFraction(oldVarsArray[h][i][key], true)} - <math>
  <mfrac>
    <mrow>${displayFraction(elementInPivotColumn, true)}<mo>*</mo>${displayFraction(oldVarsArray[simplex.pivotRow.index][i][key], true, true)}</mrow>
    <mrow><mo>${displayFraction(simplex.pivotElement, true, true)}</mo></mrow>
  </mfrac>
</math>`;
                        simplex.table.varsRows[h][i][key] = math.subtract(oldVarsArray[h][i][key], math.divide(math.multiply(elementInPivotColumn, oldVarsArray[simplex.pivotRow.index][i][key]), simplex.pivotElement));
                    } else {
                        td.innerHTML = `${displayFraction(oldVarsArray[h][i][key], true)} <mo>:</mo> ${displayFraction(simplex.pivotElement, true, true)}`;
                        simplex.table.varsRows[h][i][key] = math.divide(oldVarsArray[h][i][key], simplex.pivotElement);
                    }
                    constRow.appendChild(td);
                }
            }
        }

        for (let i = 0; i < simplex.slackVarsCount; i++) {

            for (const key in simplex.table.slackRows[h][i]) {
                {
                    let td = document.createElement("td");
                    if (h !== simplex.pivotRow.index) {
                        td.innerHTML = `${displayFraction(oldSlackArray[h][i][key], true)} - <math>
  <mfrac>
    <mrow>${displayFraction(elementInPivotColumn, true)}<mo>*</mo>${displayFraction(oldSlackArray[simplex.pivotRow.index][i][key], true, true)}</mrow>
    <mrow><mo>${displayFraction(simplex.pivotElement, true, true)}</mo></mrow>
  </mfrac>
</math>`;
                        simplex.table.slackRows[h][i][key] = math.subtract(oldSlackArray[h][i][key], math.divide(math.multiply(elementInPivotColumn, oldSlackArray[simplex.pivotRow.index][i][key]), simplex.pivotElement));
                    } else {
                        td.innerHTML = `${displayFraction(oldSlackArray[h][i][key], true)} <mo>:</mo> ${displayFraction(simplex.pivotElement, true, true)}`;
                        simplex.table.slackRows[h][i][key] = math.divide(oldSlackArray[h][i][key], simplex.pivotElement);
                    }
                    constRow.appendChild(td);
                }
            }
        }

        for (let i = 0; i < simplex.artificialVarsCount; i++) {
            for (const key in simplex.table.artificialRows[h][i]) {
                {
                    let td = document.createElement("td");
                    if (h !== simplex.pivotRow.index) {
                        td.innerHTML = `${displayFraction(oldArtificialArray[h][i][key], true)} - <math>
  <mfrac>
    <mrow>${displayFraction(elementInPivotColumn, true)}<mo>*</mo>${displayFraction(oldArtificialArray[simplex.pivotRow.index][i][key], true, true)}</mrow>
    <mrow><mo>${displayFraction(simplex.pivotElement, true, true)}</mo></mrow>
  </mfrac>
</math>`;
                        simplex.table.artificialRows[h][i][key] = math.subtract(oldArtificialArray[h][i][key], math.divide(math.multiply(elementInPivotColumn, oldArtificialArray[simplex.pivotRow.index][i][key]), simplex.pivotElement));
                    } else {
                        td.innerHTML = `${displayFraction(oldArtificialArray[h][i][key], true)} <mo>:</mo> ${displayFraction(simplex.pivotElement, true, true)}`;
                        simplex.table.artificialRows[h][i][key] = math.divide(oldArtificialArray[h][i][key], simplex.pivotElement);
                    }
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

    for (let i = 0; i <= simplex.table.objRow.length; i++) {
        let td = document.createElement('td');
        td.innerHTML = "";
        deltaTr.appendChild(td);
    };

    table.appendChild(deltaTr);
    return table;
}


