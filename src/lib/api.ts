// @ts-nocheck

async function fetchAPI<T>(endpoint: string, { body, ...customConfig }: any = {}): Promise<T> {
	const headers: { [key: string]: string } = {};

	const config: any = {
		method: body ? 'POST' : 'GET',
		headers: {
			...headers,
			...customConfig.headers
		}
	};

	if (!(body instanceof FormData)) {
		config.body = JSON.stringify(body);
		config.headers['Content-Type'] = 'application/json';
	} else {
		config.body = body;
	}

	if (customConfig.signal) {
		config.signal = customConfig.signal;
	}

	let data;

	try {
		const response = await (customConfig.fetch || fetch)(
			`${customConfig.host || import.meta.env.VITE_CHAIN_RELATED_API_URI}${endpoint}`,
			config
		);

		if (!response.ok) {
			const responseJson = await response.json();
			return Promise.reject({
				status: responseJson.code,
				message: responseJson.message
			});
		}

		data = await response.json();
		return data;
	} catch (err: any) {
		return Promise.reject({
			status: err.status,
			message: err.message
		});
	}
}

export async function get<T>(endpoint: string, customConfig: any = {}) {
	return fetchAPI<T>(endpoint, { ...customConfig, method: 'GET' });
}

export async function post<T>(endpoint: string, body: any, customConfig: any = {}) {
	return fetchAPI<T>(endpoint, { ...customConfig, body, method: 'POST' });
}

export async function put<T>(endpoint: string, body: any, customConfig: any = {}) {
	return fetchAPI<T>(endpoint, { ...customConfig, body, method: 'PUT' });
}

export async function remove<T>(endpoint: string, customConfig: any = {}) {
	return fetchAPI<T>(endpoint, { ...customConfig, method: 'DELETE' });
}

export async function batchGet<T>(endpoints: string[], customConfig: any = {}) {
	return Promise.allSettled(endpoints.map((endpoint) => get<T>(endpoint, customConfig)));
}
