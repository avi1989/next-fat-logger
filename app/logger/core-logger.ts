function logInfo<T>(data: T) {
	console.info(JSON.stringify(data, null, 2));
}

function logError<T>(data: T) {
	console.error(JSON.stringify(data, null, 2));
}

export const logger = {
	info: logInfo,
    error: logError
};
