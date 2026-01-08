import { log } from "../logger/fat-logger"

export function getPatients() {
    const patients = [{
        id: "1234",
        name: "Hello"
    }]
    log({patients})
    return patients;
}