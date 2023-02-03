function getWorkOrder(i) {
    return {
        "index": i,
        "code": `Code #${i}`,
        "assetCode": `Asset Code #${i}`,
        "assetDescription": `Asset Desc #${i}`,
        "siteCode": `Site Code #${i}`,
        "siteDescription": `Site Desc #${i}`,
        "startOn": getDate(1,10),
        "completeBy": getDate(15,28),
        "receivedOn": getDate(1,10),
        "requiredBy": getDate(1,28),
        "workStartedOn":getDate(1,10),
        "completedOn": getDate(1,28)
    }
}

function getDate(min, max) {
    let value = randomIntFromInterval(min, max);
    if(value < 10) {
        value = `0${value}`;
    }

    return `2022/11/${value} 12:00:00.000`;
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

export function getRandomData(value = 0) {

    let result = [];

    const getStartDate = ()=> {
        return `2022/12/01 00:00:00.000`;
    }

    const getEndDate = ()=> {
        return `2022/12/02 00:00:00.000`;
    }

    const i = 0
    result.push({
        "index": i,
        "code": `Code #${i}`,
        "assetCode": `Asset Code #${i}`,
        "assetDescription": `Asset Desc #${i}`,
        "siteCode": `Site Code #${i}`,
        "siteDescription": `Site Desc #${i}`,
        "startOn": getStartDate(),
        "completeBy": null,
        "receivedOn": null,
        "requiredBy": getEndDate(),
        "workStartedOn":`2022/12/01 12:00:00.000`,
        "completedOn": null
    })


    for (let i = 1; i < 100; i++) {
        result.push({
            "index": i,
            "code": `Code #${i}`,
            "assetCode": `Asset Code #${i}`,
            "assetDescription": `Asset Desc #${i}`,
            "siteCode": `Site Code #${i}`,
            "siteDescription": `Site Desc #${i}`,
            "startOn": getStartDate(),
            "completeBy": getEndDate(),
            "receivedOn": getStartDate(),
            "requiredBy": getEndDate(),
            "workStartedOn":getStartDate(),
            "completedOn": getEndDate()
        })
    }
return result;

}
