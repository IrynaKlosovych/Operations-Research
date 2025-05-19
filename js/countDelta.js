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

    let pivotColumn = { "name": "", "partM": math.fraction(0), "partWithoutM": math.fraction(0) };
    let isMax = simplex.objective.objectiveType === "max" ? true : false;

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
        let deltaElem = { "name": key, "partM": math.fraction(0), "partWithoutM": math.fraction(0) };
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

        pivotColumn = chosePivoteColumn(pivotColumn, deltaElem, isMax);

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
        let deltaElem = { "name": key, "partM": math.fraction(0), "partWithoutM": math.fraction(0) };
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

        pivotColumn = chosePivoteColumn(pivotColumn, deltaElem, isMax);

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

    if (simplex.artificialVarsCount > 0) {
        const artificialRows = simplex.table.artificialRows;
        const columnKeysArtificial = artificialRows[0].map(obj => Object.keys(obj)).flat();
        columnKeysArtificial.forEach(key => {
            let index = 0;
            let deltaElem = { "name": key, "partM": math.fraction(0), "partWithoutM": math.fraction(0) };
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

            pivotColumn = chosePivoteColumn(pivotColumn, deltaElem, isMax);

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
    }
    simplex.pivotCol = pivotColumn;

    console.log("pivotCol:");
    console.log(simplex.pivotCol);

    console.log("pivotColumn");
    console.log(pivotColumn);


    simplex.delta = deltaRow;
    return simplex;
}