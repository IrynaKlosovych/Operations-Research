class SimplexSolver {
    constructor(objective, constraints) {
        this.objective = objective; // { coefficients: [], goal: 'max' | 'min' }
        this.constraints = constraints; // [{ coefficients: [], operator: '<=' | '>=' | '=', value: number }]
        this.varCount = objective.objectiveCoeffs.length;
        this.table = {
            objRow: [],
            A0Column: [],
            varsRows: [],
            slackRows: [],
            artificialRows: []
        };
        this.slackVarsCount = this.countSlack();
        this.artificialVarsCount = this.countArtificial();

        this.pivotRow;
        this.pivotCol;
        this.pivotElement = NaN;

        this.delta = [];

        this.isOver = false;
        this.result;
        this.resultDisplayRow = "";
    }

    countArtificial() {
        let count = 0;
        for (let i = 0; i < this.constraints.length; i++) {
            if (this.constraints[i].operator !== "<=") {
                count++;
            }
        }
        return count;
    }
    countSlack() {
        let count = 0;
        for (let i = 0; i < this.constraints.length; i++) {
            if (this.constraints[i].operator !== "=") {
                count++;
            }
        }
        return count;
    }
}

function simplexCount(simplex) {
    let div = document.createElement("div");

    while (!simplex.isOver) {
        simplex = checkResult(simplex);
        console.log(simplex);
        if (simplex.isOver) break;
        simplex = chosePivoteRow(simplex);
        div.appendChild(generateMidTable(simplex));
        div.appendChild(generateBaseTable(simplex));
    }
    let resDiv = document.createElement("div");
    resDiv.innerHTML = simplex.resultDisplayRow;
    div.appendChild(resDiv);
    return div;
}

function chosePivoteColumn(column1, column2, isMax) {

    const m1 = column1.partM;
    const m2 = column2.partM;
    const p1 = column1.partWithoutM;
    const p2 = column2.partWithoutM;

    if (isMax === true) {
        if (math.smaller(m1, m2) && math.smaller(m1, 0)) {
            return column1;
        } else if (math.smaller(m2, m1) && math.smaller(m2, 0)) {
            return column2;
        } else if (math.equal(m1, m2)) {
            if (math.smaller(p1, p2) && math.smaller(p1, 0)) {
                return column1;
            } else if (math.smaller(p2, p1) && math.smaller(p2, 0)) {
                return column2;
            }
        }
        return column1;
    }
    else {
        if (math.larger(m1, m2) && math.larger(m1, 0)) {
            return column1;
        } else if (math.larger(m2, m1) && math.larger(m2, 0)) {
            return column2;
        } else if (math.equal(m1, m2)) {
            if (math.larger(p1, p2) && math.larger(p1, 0)) {
                return column1;
            } else if (math.larger(p2, p1) && math.larger(p2, 0)) {
                return column2;
            }
        }
        return column1;
    }
}

function chosePivoteRow(simplex) {
    //вибирати рядок
    let arrRows;
    let min = { "name": "", "valueOfNum": math.fraction(Number.MAX_VALUE), "valueOfRatio": math.fraction(Number.MAX_VALUE), "index": -1 };
    if (hasKeyInNestedArray(simplex.table.varsRows, simplex.pivotCol.name)) {
        arrRows = simplex.table.varsRows;
    }
    if (hasKeyInNestedArray(simplex.table.slackRows, simplex.pivotCol.name)) {
        arrRows = simplex.table.slackRows;
    }
    if (hasKeyInNestedArray(simplex.table.artificialRows, simplex.pivotCol.name)) {
        arrRows = simplex.table.artificialRows;
    }

    arrRows.forEach((row, index) => {
        const cell = row.find(obj => obj.hasOwnProperty(simplex.pivotCol.name));
        if (!cell) return;

        const value = cell[simplex.pivotCol.name];
        if (!math.smallerEq(value, math.fraction(0))) {
            simplex.table.A0Column.forEach((a0Row, indexA0) => {
                const a0Key = Object.keys(a0Row)[0];
                const a0Value = a0Row[a0Key];
                if (index === indexA0) {
                    let ratio = math.divide(a0Value, value);
                    if (math.smaller(ratio, min.valueOfRatio)) {
                        min.name = a0Key;
                        min.valueOfNum = value;
                        min.valueOfRatio = ratio;
                        min.index = index;
                    }
                }
            });
        }
    });
    simplex.pivotRow = min;
    simplex.pivotElement = min.valueOfNum;
    // змінити базис ключ
    let newA0;
    simplex.table.A0Column.forEach((a0Row, index) => {
        const a0Key = Object.keys(a0Row)[0];
        if (a0Key === simplex.pivotRow.name) {
            newA0 = renameNestedKeyAtSamePosition(simplex.table.A0Column, a0Key, simplex.pivotCol.name);
        }
    });
    simplex.table.A0Column = newA0;

    //видаляти лишні штучні змінні (в масиві + цільовій)
    const hasKey = simplex.table.artificialRows.some(row =>
        row.some(obj => obj.hasOwnProperty(simplex.pivotRow.name))
    );
    if (hasKey) {
        const cleanedArt = simplex.table.artificialRows.map(row =>
            row.filter(obj => !obj.hasOwnProperty(simplex.pivotRow.name))
        );
        simplex.table.artificialRows = cleanedArt;
        const cleanedObj = simplex.table.objRow.filter(obj =>
            !obj.hasOwnProperty(simplex.pivotRow.name)
        );
        simplex.table.objRow = cleanedObj;
        simplex.artificialVarsCount--;
    }
    return simplex;
}


function checkResult(simplex) {
    // перевіряти щодо макс і мін
    //відповідно чи всі елементи в індексному рядку ок
    // чи відсутні штучні змінні
    simplex.table.artificialRows = simplex.table.artificialRows.filter(subArray => subArray.length > 0);

    if (simplex.pivotCol.name.length === 0 && simplex.table.artificialRows.length === 0) {
        simplex.resultDisplayRow = "Знайдено оптимальне значення";
        simplex.result = simplex.delta[0];
        simplex.isOver = true;
        return simplex;
    }
    if (simplex.pivotCol.name.length === 0 && simplex.table.artificialRows.length !== 0) {
        simplex.resultDisplayRow = "Нема рішення. Штучні змінні не виведено";
        simplex.isOver = true;
        return simplex;
    }
    // чи всі співвіднощення ок

    let arrRows;
    let countNums = 0;
    if (hasKeyInNestedArray(simplex.table.varsRows, simplex.pivotCol.name)) {
        arrRows = simplex.table.varsRows;
    }
    if (hasKeyInNestedArray(simplex.table.slackRows, simplex.pivotCol.name)) {
        arrRows = simplex.table.slackRows;
    }
    if (hasKeyInNestedArray(simplex.table.artificialRows, simplex.pivotCol.name)) {
        arrRows = simplex.table.artificialRows;
    }

    arrRows.forEach(row => {
        const cell = row.find(obj => obj.hasOwnProperty(simplex.pivotCol.name));
        if (!cell) return;

        const value = cell[simplex.pivotCol.name];
        if (math.smallerEq(value, math.fraction(0))) {
            countNums++;
        }
    });

    if (countNums === simplex.constraints.length) {
        simplex.resultDisplayRow = "Нема рішення. В напрямному стовпці всі значення менші або рівні 0";
        simplex.isOver = true;
    }

    return simplex;
}


function toCanonicalForm(constraints) {
    return constraints.map(constraint => {
        if (constraint.value < 0) {

            const newCoefficients = constraint.coefficients.map(c => -c);
            const newValue = -constraint.value;


            let newOperator;
            if (constraint.operator === "<=") newOperator = ">=";
            else if (constraint.operator === ">=") newOperator = "<=";
            else newOperator = "=";

            return {
                coefficients: newCoefficients,
                operator: newOperator,
                value: newValue
            };
        } else {
            return constraint;
        }
    });
}


function generateBase(simplex) {
    let objRow = []; //+
    let A0Column = [];//+
    let varsRows = []; //+
    let slackRows = [];//+
    let artificialRows = [];//+

    let slackIndex = 0;
    let artificialIndex = 0;
    for (let i = 0; i < simplex.constraints.length; i++) {
        let variableRow = [];
        for (let j = 0; j < simplex.constraints[i].coefficients.length; j++) {
            let varName = `x${j + 1}`;
            let value = math.fraction(simplex.constraints[i].coefficients[j]);
            variableRow.push({ [varName]: value });
        }
        varsRows.push(variableRow);


        if (simplex.constraints[i].operator === "<=") {
            let slackRow = [];
            for (let j = 0; j < simplex.slackVarsCount; j++) {
                let varName = `x${simplex.varCount + j + 1}`;
                let value;
                if (slackIndex === j) {
                    value = math.fraction(1);
                    A0Column.push({ [varName]: math.fraction(simplex.constraints[i].value) });
                }
                else {
                    value = math.fraction(0);
                }
                slackRow.push({ [varName]: value });
            }
            slackIndex++;
            slackRows.push(slackRow);
        }
        else if (simplex.constraints[i].operator === ">=") {
            let slackRow = [];
            for (let j = 0; j < simplex.slackVarsCount; j++) {
                let varName = `x${simplex.varCount + j + 1}`;
                let value;
                if (slackIndex === j) {
                    value = math.fraction(-1);
                }
                else {
                    value = math.fraction(0);
                }
                slackRow.push({ [varName]: value });
            }
            slackIndex++;
            slackRows.push(slackRow);
        }
        else {
            let slackRow = [];
            for (let j = 0; j < simplex.slackVarsCount; j++) {
                let varName = `x${simplex.varCount + j + 1}`;
                let value = math.fraction(0);
                slackRow.push({ [varName]: value });
            }
            slackRows.push(slackRow);
        }

        if (simplex.constraints[i].operator !== "<=") {
            let artificialRow = [];
            for (let j = 0; j < simplex.artificialVarsCount; j++) {
                let varName = `x${simplex.varCount + simplex.slackVarsCount + j + 1}`;
                let value;
                if (artificialIndex === j) {
                    value = math.fraction(1);
                    A0Column.push({ [varName]: math.fraction(simplex.constraints[i].value) });
                }
                else {
                    value = math.fraction(0);
                }
                artificialRow.push({ [varName]: value });
            }
            artificialIndex++;
            artificialRows.push(artificialRow);
        }
        else {
            let artificialRow = [];
            for (let j = 0; j < simplex.artificialVarsCount; j++) {
                let varName = `x${simplex.varCount + simplex.slackVarsCount + j + 1}`;
                let value = math.fraction(0);
                artificialRow.push({ [varName]: value });
            }
            artificialRows.push(artificialRow);
        }
    }

    for (let i = 0; i < simplex.objective.objectiveCoeffs.length; i++) {
        let varName = `x${i + 1}`;
        let value = math.fraction(simplex.objective.objectiveCoeffs[i]);
        objRow.push({ [varName]: value });
    }
    for (let i = 0; i < simplex.slackVarsCount; i++) {
        let varName = `x${simplex.varCount + i + 1}`;
        objRow.push({ [varName]: 0 });
    } for (let i = 0; i < simplex.artificialVarsCount; i++) {
        let varName = `x${simplex.varCount + simplex.slackVarsCount + i + 1}`;
        let value;
        if (simplex.objective.objectiveType === "max") {
            value = Number.MIN_VALUE;
        }
        else {
            value = Number.MAX_VALUE;
        }

        objRow.push({ [varName]: value });
    }
    simplex.table.objRow = objRow;
    simplex.table.A0Column = A0Column;
    simplex.table.varsRows = varsRows;
    simplex.table.slackRows = slackRows;
    simplex.table.artificialRows = artificialRows;
    return simplex;
}

