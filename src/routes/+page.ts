import { get } from "$lib/api.js";

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
    data: { date: string; data_size: number; estimate_celestia_da_fee_usd: number; transaction_fee_on_l1_usd: number }[];
    da_fee_usd_per_byte: number;
    last_updated_at: string;
}

export async function load({ fetch }) {
    return await get<DaFeeTracker>(`/v1/explorer/da_fee_tracker`, { fetch });
}
