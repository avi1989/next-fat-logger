import { log, withLogging } from "@/app/logger/fat-logger";
import { getPatients } from "@/app/services/patient-service";
import { NextRequest } from "next/server";

function getUsers(req: NextRequest) {
    log({
        hello: "world"
    })
    const patients = getPatients();
    
    return Response.json(patients)
}

export const GET = withLogging(getUsers)