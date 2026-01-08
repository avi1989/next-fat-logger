function logInfo<T>(data: T) {
	console.info(data);
}

function logError<T>(data: T) {
	console.error(data);
}

export const logger = {
	info: logInfo,
    error: logError
};
