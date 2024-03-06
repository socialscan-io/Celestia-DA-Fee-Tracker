import { fetchData } from './page.js';

export async function load({ fetch, url }) {
	const chain = url.searchParams.get('chain') || 'all';
	return await fetchData({ fetch, chain });
}
