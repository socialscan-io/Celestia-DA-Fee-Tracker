import { get } from '$lib/api';

export interface Metrics {
	total_data_size: number;
	total_l1_da_fee_usd: number;
	total_transaction_count: number;
	total_celestia_da_fee_usd: number;
	latest_data_size: number;
	latest_l1_da_fee_usd: number;
	latest_transaction_count: number;
	latest_estimate_celestia_da_fee_usd: number;
}

export interface CalculatedDAFee {
	transaction_count: number;
	estimate_data_size: number;
	estimate_l1_da_fee_usd: number;
	estimate_celestia_da_fee_usd: number;
	latest_hour_avg_eth_price: number;
	latest_hour_avg_tia_price: number;
}

export interface DaFeeTracker {
	metrics: Metrics;
	data: {
		date: string;
		data_size: number;
		estimate_celestia_da_fee_usd: number;
		transaction_fee_on_l1_usd: number;
	}[];
	da_fee_usd_per_byte: number;
	last_updated_at: string;
}

export interface Stats {
	total_transactions: number;
	transaction_tps: number;
	latest_batch: number;
	latest_block: number;
	avg_block_time: number;
	eth_price: number;
	eth_price_btc: number;
	eth_price_diff: number;
	matic_price_eth: number;
	matic_price: number;
	matic_price_diff: number;
	native_token_price: number;
	native_token_price_eth: number;
	native_token_price_diff: number;
	dashboard_token_price_eth: number;
	dashboard_token_price: number;
	dashboard_token_price_diff: number;
	gas_fee: number;
}

export async function fetchData(params: any) {
	return await get<DaFeeTracker>(`/v1/celestia/da_fee_tracker?chain=${params.chain}`, {
		fetch: params.fetch
	});
}

export async function fetchStatsData(params: any) {
	return get<Stats>('/v1/explorer/stats', { fetch: params.fetch });
}
