function getWorkOrder(i) {
    return {
        "code": `Code #${i}`,
        "assetCode": `Asset Code #${i}`,
        "assetDescription": `Asset Desc #${i}`,
        "siteCode": `Site Code #${i}`,
        "siteDescription": `Site Desc #${i}`,
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
    return `2022/01/${value} 12:00:00.000`;
}

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function getWorkOrders() {
    let result = [];
    for (let i = 0; i < 100000; i++) {
        result.push(getWorkOrder(i));
    }
    return result;
}

export const workOrderSamples = getWorkOrders();
