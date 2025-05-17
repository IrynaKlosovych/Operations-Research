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
