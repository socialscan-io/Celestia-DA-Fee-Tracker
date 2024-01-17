export function formatNumberToKMB(num: number, digitsCount = 2) {
	let unit = '';
	let divisor = 1;

	if (num >= 1e9) {
		divisor = 1e9;
		unit = 'B';
	} else if (num >= 1e6) {
		divisor = 1e6;
		unit = 'M';
	} else if (num >= 1e3) {
		divisor = 1e3;
		unit = 'K';
	}

	let result = (num / divisor).toFixed(digitsCount);

	// remove unnecessary .0， .00
	if (parseFloat(result) === Math.floor(parseFloat(result))) {
		result = parseFloat(result).toString();
	}

	return result + unit;
}

export function formatNumber(num: number | string, maximumFractionDigits = 16) {
	const formatter = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits
	});

	return formatter.format(Number(num));
}

type ApiFunction<T = any> = (query: T, signal: AbortSignal) => Promise<any>;
export function createDebouncedRequest<T>(
	fetchFunction: ApiFunction<T>,
	delay: number = 500
): (query: T) => void {
	let currentController: AbortController;
	let timer: ReturnType<typeof setTimeout> | undefined;

	return function (query: T) {
		if (timer) {
			clearTimeout(timer);
		}

		if (currentController) {
			currentController.abort();
		}

		currentController = new AbortController();

		timer = setTimeout(() => {
			fetchFunction(query, currentController.signal)?.catch((error) => {
				if (error.name !== 'AbortError') {
					console.error('Fetch error:', error);
				}
			});
		}, delay);
	};
}

export function formatBytes(bytes: number, decimals = 2) {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

	const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), 4);

	return formatNumber(bytes / Math.pow(k, i), dm) + ' ' + sizes[i];
}
