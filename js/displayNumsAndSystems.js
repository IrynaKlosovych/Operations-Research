function displayFraction(fraction, isFirst = false) {
    let sign = '';

    if (fraction.s === -1n) {
        sign = '-';
    } else if (!isFirst) {
        sign = '+';
    }

    if (fraction.d !== 1n) {
        return `<math>
  <mo>${sign}</mo>
  <mfrac>
    <mrow><mo>${fraction.n}</mo></mrow>
    <mrow><mo>${fraction.d}</mo></mrow>
  </mfrac>
</math>`;
    } else {
        return `<math><mo>${sign} ${fraction.n}</mo></math>`;
    }
}

function displayInt(number, isFirst = false) {
    let sign = '';

    if (number < 0) {
        sign = '-';
    } else if (!isFirst) {
        sign = '+';
    }
    return `<math><mo>${sign} ${Math.abs(number)}</mo></math>`;
}

function generateSystemInequation(simplex) {
    let resultSystem = `<div class="system"><div>F(`;
    for (let i = 0; i < simplex.objective.objectiveCoeffs.length; i++) {
        resultSystem += `x<sub>${i + 1}</sub>`;
        if (i === simplex.objective.objectiveCoeffs.length - 1) {
            resultSystem += `) =`;
        }
        else {
            resultSystem += `, `;
        }
    }
    let isFirst = true;

    for (let i = 0; i < simplex.objective.objectiveCoeffs.length; i++) {
        if (i > 0) isFirst = false;
        resultSystem += displayInt(simplex.objective.objectiveCoeffs[i], isFirst) +
            `<math><msub><mi>x</mi><mn>${i + 1}</mn></msub></math>`;
    }
    resultSystem += ` &rarr; ${simplex.objective.objectiveType}</div>`;
    resultSystem += `<div><math xmlns="http://www.w3.org/1998/Math/MathML">
  <mo>{</mo>
  <mtable>`;

    for (let i = 0; i < simplex.constraints.length; i++) {
        let isFirst = true;
        resultSystem += `<mtr><mtd><mrow>`;
        for (let j = 0; j < simplex.constraints[i].coefficients.length; j++) {
            if (j > 0) isFirst = false;
            resultSystem += displayInt(simplex.constraints[i].coefficients[j], isFirst) +
                `<msub><mi>x</mi><mn>${j + 1}</mn></msub>`;
        }
        resultSystem += `<mo>${convertOperatorToMathMLOperator(simplex.constraints[i].operator)}</mo>` + displayInt(simplex.constraints[i].value, true) + `</mrow></mtd></mtr>`;
    }

    resultSystem += `<mtr><mtd><mrow>`;
    for (let i = 0; i < simplex.objective.objectiveCoeffs.length; i++) {
        resultSystem += `<msub><mi>x</mi><mn>${i + 1}</mn></msub>`;
        if (i === simplex.objective.objectiveCoeffs.length - 1) {
            resultSystem += `<mo>&ge; 0 </mo></mrow></mtd></mtr>`;
        }
        else {
            resultSystem += `<mo>,</mo> `;
        }
    }
    resultSystem += `</mtable></math></div></div>`;

    return resultSystem;
}

function displayObjective(number, isFirst) {
    let sign = '';
    let num;

    if (number < 0 || number === Number.MIN_VALUE) {
        sign = '-';
    } else if (!isFirst) {
        sign = '+';
    }

    if (number != Number.MAX_VALUE && number != Number.MIN_VALUE) {
        num = Math.abs(number).toString();
    }
    else num = "M";

    return `<math><mo>${sign} ${num}</mo></math>`;
}

function generateSystemEquation(simplex) {
    let resultSystem = `<div class="system"><div>F(`;
    for (let i = 0; i < simplex.table.objRow.length; i++) {
        resultSystem += `x<sub>${i + 1}</sub>`;
        if (i === simplex.table.objRow.length - 1) {
            resultSystem += `) =`;
        }
        else {
            resultSystem += `, `;
        }
    }
    let isFirst = true;

    for (let i = 0; i < simplex.table.objRow.length; i++) {
        if (i > 0) isFirst = false;

        for (const key in simplex.table.objRow[i]) {
            resultSystem += displayObjective(simplex.table.objRow[i][key], isFirst) +
                `<math><msub><mi>x</mi><mn>${i + 1}</mn></msub></math>`;
        }

    }
    resultSystem += ` &rarr; ${simplex.objective.objectiveType}</div>`;
    resultSystem += `<div><math xmlns="http://www.w3.org/1998/Math/MathML">
  <mo>{</mo>
  <mtable>`;

    for (let h = 0; h < simplex.constraints.length; h++) {
        isFirst = true;
        let key = Object.keys(simplex.table.A0Column[h])[0];
        resultSystem += `<mtr><mtd><mrow>`;

        for (let i = 0; i < simplex.varCount; i++) {
            if (i > 0) isFirst = false;
            for (const key in simplex.table.varsRows[h][i]) {
                {
                    resultSystem += displayInt(simplex.table.varsRows[h][i][key], isFirst) +
                        `<msub><mi>x</mi><mn>${i + 1}</mn></msub>`;
                }
            }
        }

        for (let i = 0; i < simplex.slackVarsCount; i++) {

            for (const key in simplex.table.slackRows[h][i]) {
                {
                    resultSystem += displayInt(simplex.table.slackRows[h][i][key], isFirst) +
                        `<msub><mi>x</mi><mn>${simplex.varCount + i + 1}</mn></msub>`;
                }
            }
        }

        for (let i = 0; i < simplex.artificialVarsCount; i++) {

            for (const key in simplex.table.artificialRows[h][i]) {
                {
                    resultSystem += displayInt(simplex.table.artificialRows[h][i][key], isFirst) +
                        `<msub><mi>x</mi><mn>${simplex.varCount + simplex.slackVarsCount + i + 1}</mn></msub>`;
                }

            }
        }
        resultSystem += `<mo>=</mo>` + displayInt(simplex.table.A0Column[h][key], true) + `</mrow></mtd></mtr>`;

    }

    resultSystem += `<mtr><mtd><mrow>`;
    for (let i = 0; i < simplex.table.objRow.length; i++) {
        resultSystem += `<msub><mi>x</mi><mn>${i + 1}</mn></msub>`;
        if (i === simplex.table.objRow.length - 1) {
            resultSystem += `<mo>&ge; 0 </mo></mrow></mtd></mtr>`;
        }
        else {
            resultSystem += `<mo>,</mo> `;
        }
    }
    resultSystem += `</mtable></math></div></div>`;

    return resultSystem;
}
