import { log, withLogging } from "@/app/logger/fat-logger";
import { NextRequest } from "next/server";
import { json } from "stream/consumers";

function getUsers(req: NextRequest) {
    log({
        works: true,
    })
    return Response.json({
        "hello": "world"
    })
}

export const GET = withLogging(getUsers)