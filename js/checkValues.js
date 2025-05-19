function checkValue(input) {
    const minValue = parseInt(input.min);
    const maxValue = parseInt(input.max);

    if (parseInt(input.value) < minValue) {
        input.value = minValue;
    }

    if (parseInt(input.value) > maxValue) {
        input.value = maxValue;
    }
}

function allowOnlyNumbers(event) {
    const key = event.key;
    if (!/^[0-9]$/.test(key) && key !== "Backspace" && key !== "ArrowLeft" && key !== "ArrowRight" && key !== "Tab") {
        event.preventDefault();
    }
}

function checkInteger() {
    let allValid = true;

    document.querySelectorAll('input[id$="_a"]').forEach(input => {
        const inputValue = input.value.trim();

        if (!/^-?\d+$/.test(inputValue)) {
            allValid = false;
        }
    });

    return allValid;
}

function convertOperatorToMathMLOperator(op) {
    switch (op) {
        case "<=": return "&le;";
        case ">=": return "&ge;";
        case "=": return "=";
        default: return op;
    }
}

function hasKeyInArray(arr, key) {
    return arr.some(obj => Object.prototype.hasOwnProperty.call(obj, key));
}

function hasKeyInNestedArray(arr, key) {
    return arr.some(innerArr => hasKeyInArray(innerArr, key));
}

function renameNestedKeyAtSamePosition(array, oldKey, newKey) {
    return array.map(obj => {
        const newObj = {};
        const keys = Object.keys(obj); // порядок ключів

        for (const key of keys) {
            if (key === oldKey) {
                newObj[newKey] = obj[key];
            } else {
                newObj[key] = obj[key];
            }
        }

        return newObj;
    });
}


function deepCloneWithFractions(obj) {
    if (Array.isArray(obj)) {
        return obj.map(deepCloneWithFractions);
    } else if (obj && typeof obj === 'object') {
        if (obj instanceof math.Fraction) {
            return math.fraction(obj.s * obj.n, obj.d);
        }

        const newObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = deepCloneWithFractions(obj[key]);
            }
        }
        return newObj;
    }
    return obj;
}

function cloneA0ColumnWithFractions(A0Column) {
    return A0Column.map(cell => {
        const [key] = Object.keys(cell);
        const value = cell[key];

        if (value instanceof math.Fraction) {
            return { [key]: math.fraction(value.s * value.n, value.d) };
        }

        return { [key]: value };
    });
}
