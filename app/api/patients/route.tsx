import { flushLog, log } from "@/app/logger/fat-logger";
import { getPatients } from "@/app/services/patient-service";
import { NextRequest } from "next/server";

function getUsers(req: NextRequest) {
    log({
        hello: "world"
    })

    const patients = getPatients();
    
    flushLog();
    return Response.json(patients)
}

export const GET = getUsers