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

        this.pivotRow = 0;
        this.pivotCol = 0;
        this.pivotElement = NaN;

        this.delta = [];
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

function simplexCount(simplex){


    
}

function countDelta(simplex) {
    let objMult = [];
    let deltaRow = [];
    simplex.table.objRow.forEach(elementObj => {
        const keyObj = Object.keys(elementObj)[0];
        simplex.table.A0Column.forEach(elementA0 => {
            const keyA0 = Object.keys(elementA0)[0];

            if (keyObj === keyA0) {
                const frac = elementObj[keyObj];
                objMult.push({ [keyObj]: frac });
            }
        });
    });

    let deltaA0 = { "partM": math.fraction(0), "partWithoutM": math.fraction(0) };
    let deltaA0Res = "";
    objMult.forEach(elementMult => {
        const keyMult = Object.keys(elementMult)[0];

        simplex.table.A0Column.forEach(elementA0 => {
            const keyA0 = Object.keys(elementA0)[0];

            if (keyMult === keyA0) {
                if (elementMult[keyMult] === Number.MAX_VALUE) {
                    deltaA0.partM = math.add(deltaA0.partM, math.multiply(math.fraction(1), elementA0[keyA0]));
                }
                else if (elementMult[keyMult] === Number.MIN_VALUE) {
                    deltaA0.partM = math.add(deltaA0.partM, math.multiply(math.fraction(-1), elementA0[keyA0]));
                } else {
                    deltaA0.partWithoutM = math.add(deltaA0.partWithoutM, math.multiply(elementMult[keyMult], elementA0[keyA0]));
                }
            }
        });
    });
    if (deltaA0.partM.n !== 0n) {
        deltaA0Res += displayFraction(deltaA0.partM, true) + "M";
        if (deltaA0.partWithoutM.n !== 0n) {
            deltaA0Res += displayFraction(deltaA0.partWithoutM);
        }
    }
    else {
        deltaA0Res += displayFraction(deltaA0.partWithoutM, true);
    }
    deltaRow.push(deltaA0Res);

    let pivotColumn = { "name": "", "partM": math.fraction(0), "partWithoutM": math.fraction(0) };///
    let isMax = simplex.objective.objectiveType === "max" ? true : false;///

    let objForDelta = [];

    simplex.table.A0Column.forEach(elementA0 => {
        const keyA0 = Object.keys(elementA0)[0];
        objMult.forEach(elementMult => {
            const keyMult = Object.keys(elementMult)[0];
            if (keyMult === keyA0) {
                objForDelta.push(elementMult[keyMult]);
            }
        });
    });

    const varsRows = simplex.table.varsRows;
    const columnKeys = varsRows[0].map(obj => Object.keys(obj)).flat();
    columnKeys.forEach(key => {
        let index = 0;
        let deltaElem = { "partM": math.fraction(0), "partWithoutM": math.fraction(0) };
        varsRows.map(row => {
            for (let i = 0; i < objForDelta.length; i++) {
                if (i === index) {
                    const cell = row.find(obj => obj.hasOwnProperty(key));
                    if (objForDelta[i] === Number.MAX_VALUE) {
                        deltaElem.partM = math.add(deltaElem.partM, math.multiply(math.fraction(1), cell[key]));
                    }
                    else if (objForDelta[i] === Number.MIN_VALUE) {
                        deltaElem.partM = math.add(deltaElem.partM, math.multiply(math.fraction(-1), cell[key]));
                    } else {
                        deltaElem.partWithoutM = math.add(deltaElem.partWithoutM, math.multiply(objForDelta[i], cell[key]));
                    }
                }
            }
            index++;
        });

        const foundObj = simplex.table.objRow.find(obj => obj.hasOwnProperty(key));

        if (foundObj[key] === Number.MAX_VALUE) {
            deltaElem.partM = math.add(deltaElem.partM, math.fraction(-1));
        }
        else if (foundObj[key] === Number.MIN_VALUE) {
            deltaElem.partM = math.add(deltaElem.partM, math.fraction(1));
        } else {
            deltaElem.partWithoutM = math.subtract(deltaElem.partWithoutM, math.fraction(foundObj[key]));
        }

        let deltaRes = "";
        if (deltaElem.partM.n !== 0n) {
            deltaRes += displayFraction(deltaElem.partM, true) + "M";
            if (deltaElem.partWithoutM.n !== 0n) {
                deltaRes += displayFraction(deltaElem.partWithoutM);
            }
        }
        else {
            deltaRes += displayFraction(deltaElem.partWithoutM, true);
        }
        deltaRow.push(deltaRes);
    });


    const slackRows = simplex.table.slackRows;
    const columnKeysSlack = slackRows[0].map(obj => Object.keys(obj)).flat();
    columnKeysSlack.forEach(key => {
        let index = 0;
        let deltaElem = { "partM": math.fraction(0), "partWithoutM": math.fraction(0) };
        slackRows.map(row => {
            for (let i = 0; i < objForDelta.length; i++) {
                if (i === index) {
                    const cell = row.find(obj => obj.hasOwnProperty(key));
                    if (objForDelta[i] === Number.MAX_VALUE) {
                        deltaElem.partM = math.add(deltaElem.partM, math.multiply(math.fraction(1), cell[key]));
                    }
                    else if (objForDelta[i] === Number.MIN_VALUE) {
                        deltaElem.partM = math.add(deltaElem.partM, math.multiply(math.fraction(-1), cell[key]));
                    } else {
                        deltaElem.partWithoutM = math.add(deltaElem.partWithoutM, math.multiply(objForDelta[i], cell[key]));
                    }
                }
            }
            index++;
        });

        const foundObj = simplex.table.objRow.find(obj => obj.hasOwnProperty(key));

        if (foundObj[key] === Number.MAX_VALUE) {
            deltaElem.partM = math.add(deltaElem.partM, math.fraction(-1));
        }
        else if (foundObj[key] === Number.MIN_VALUE) {
            deltaElem.partM = math.add(deltaElem.partM, math.fraction(1));
        } else {
            deltaElem.partWithoutM = math.subtract(deltaElem.partWithoutM, math.fraction(foundObj[key]));
        }

        let deltaRes = "";
        if (deltaElem.partM.n !== 0n) {
            deltaRes += displayFraction(deltaElem.partM, true) + "M";
            if (deltaElem.partWithoutM.n !== 0n) {
                deltaRes += displayFraction(deltaElem.partWithoutM);
            }
        }
        else {
            deltaRes += displayFraction(deltaElem.partWithoutM, true);
        }
        deltaRow.push(deltaRes);
    });


    const artificialRows = simplex.table.artificialRows;
    const columnKeysArtificial = artificialRows[0].map(obj => Object.keys(obj)).flat();
    columnKeysArtificial.forEach(key => {
        let index = 0;
        let deltaElem = { "partM": math.fraction(0), "partWithoutM": math.fraction(0) };
        artificialRows.map(row => {
            for (let i = 0; i < objForDelta.length; i++) {
                if (i === index) {
                    const cell = row.find(obj => obj.hasOwnProperty(key));
                    if (objForDelta[i] === Number.MAX_VALUE) {
                        deltaElem.partM = math.add(deltaElem.partM, math.multiply(math.fraction(1), cell[key]));
                    }
                    else if (objForDelta[i] === Number.MIN_VALUE) {
                        deltaElem.partM = math.add(deltaElem.partM, math.multiply(math.fraction(-1), cell[key]));
                    } else {
                        deltaElem.partWithoutM = math.add(deltaElem.partWithoutM, math.multiply(objForDelta[i], cell[key]));
                    }
                }
            }
            index++;
        });

        const foundObj = simplex.table.objRow.find(obj => obj.hasOwnProperty(key));

        if (foundObj[key] === Number.MAX_VALUE) {
            deltaElem.partM = math.add(deltaElem.partM, math.fraction(-1));
        }
        else if (foundObj[key] === Number.MIN_VALUE) {
            deltaElem.partM = math.add(deltaElem.partM, math.fraction(1));
        } else {
            deltaElem.partWithoutM = math.subtract(deltaElem.partWithoutM, math.fraction(foundObj[key]));
        }

        let deltaRes = "";
        if (deltaElem.partM.n !== 0n) {
            deltaRes += displayFraction(deltaElem.partM, true) + "M";
            if (deltaElem.partWithoutM.n !== 0n) {
                deltaRes += displayFraction(deltaElem.partWithoutM);
            }
        }
        else {
            deltaRes += displayFraction(deltaElem.partWithoutM, true);
        }
        deltaRow.push(deltaRes);
    });

    simplex.delta = deltaRow;
    return simplex;
}

function chosePivoteColumn(){

}

// function checkResult(){

// }


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

