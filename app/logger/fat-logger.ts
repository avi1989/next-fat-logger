import { NextRequest } from "next/server";
import { logger } from "./core-logger";

export type WideEvent = {
	timestamp: string;
	request_id?: string | null;
	trace_id?: string;
	method?: string;
	path?: string;
	status_code?: number;
	duration_ms?: number;
	outcome?: "success" | "error";
	error?: {
		status?: string;
        exception: any;
	};

    [key: string]: unknown;
};

const storage = new AsyncLocalStorage<WideEvent>();

type Handler<C> = (req: NextRequest, ctx: C) => Promise<Response | null> | Response | null;

export function withLogging<C>(handler: Handler<C>, name?: string): Handler<C> {
    return async (req: NextRequest, ctx: C) => {
        let res: Response | null = null;
        let error: unknown = null;
        const start = performance.now();
        const event: WideEvent = {
            timestamp: new Date().toISOString(),
            //TODO: Extract path from url
            path: req.url,
            method: req.method,
        }
        await storage.run(event, async () => {
            try {
                res = await handler(req, ctx);
                event.outcome = "success"
            }
            catch(e) {
                error = e;
                event.outcome = "error";
                event.error = {
                    exception: e,
                    status: res?.status.toString()
                }
            }
            finally {
                event.duration_ms = performance.now() - start;
                logger.info(event)
            }
        })
        if (error) {
            logger.error(event)
            throw error;
        }
        return res;
    }
}


export const log = (data: any) => {
    const store = storage.getStore();
    Object.assign(store!, data)
}