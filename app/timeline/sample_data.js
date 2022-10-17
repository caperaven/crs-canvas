function getWorkOrder() {


    return {
        "code": "full bars",
        "startOn": getDate(1,10),
        "completeBy": getDate(15,28),
        "receivedOn": getDate(1,10),
        "requiredBy": getDate(15,28),
        "workStartedOn":getDate(1,10),
        "completedOn": getDate(15,28)
    }
}

function getDate(min, max) {
    let value = randomIntFromInterval(min, max);
    if(value < 10) {
        value = `0${value}`;
    }
    return `${value}/01/2022 12:00:00.000`;
}

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function getWorkOrders() {
    let result = [];
    for (let i = 0; i < 100000; i++) {
        result.push(getWorkOrder());
    }
    return result;
}

export const workOrderSamples = getWorkOrders();
console.log(workOrderSamples);