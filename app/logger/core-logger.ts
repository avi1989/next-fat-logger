function logInfo<T>(data: T) {
	console.info(data);
}

export const logger = {
	info: logInfo,
};
