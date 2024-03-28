<script lang="ts">
	import { page } from '$app/stores';
	import {
		createDebouncedRequest,
		formatBytes,
		formatNumber,
		formatNumberToKMB
	} from '$lib/common';
	import { Chart } from 'chart.js/auto';
	import { Input, Label, Select, Spinner, Tooltip } from 'flowbite-svelte';

	import { get } from '$lib/api';
	import { onMount } from 'svelte';
	import { fetchData, type CalculatedDAFee, type DaFeeTracker } from './page';

	import CelestiaPng from '$lib/assets/celestia.png';
	import InfoCircle from '$lib/assets/info-circle.svg';

	export let data: DaFeeTracker;

	let container: any;

	let transactionType: number;
	let transactionCount: number;

	let calculating = false;
	// 'all', 'orderly', 'aevo', 'lyra', 'pgn', 'hypr', 'ancient8'
	const chainList = [
		{
			name: 'Overview',
			id: 'all',
			img: null
		},
		{
			name: 'Manta Pacific',
			id: 'manta-pacific',
			img: '/images/manta-pacific.png'
		},
		{
			name: 'Orderly',
			id: 'orderly',
			img: '/images/orderly.png'
		},
		{
			name: 'Aevo',
			id: 'aevo',
			img: '/images/aevo.png'
		},
		{
			name: 'Lyra',
			id: 'lyra',
			img: '/images/lyra.png'
		},
		{
			name: 'Public Good Networks',
			id: 'pgn',
			img: '/images/public-good-networks.png'
		},
		{
			name: 'Hypr',
			id: 'hypr',
			img: '/images/hypr.png'
		},
		{
			name: 'Ancient8',
			id: 'ancient8',
			img: '/images/ancient8.png'
		}
	];

	const transactionTypes = [
		{ name: 'Mixed of Common Blockchain Transactions', value: 0 },
		{ name: 'ETH: Transfer', value: 1 },
		{ name: 'ERC20 Transfer', value: 2 },
		{ name: 'ERC20 Swap', value: 3 },
		{ name: 'ERC721 Mint', value: 4 },
		{ name: 'ERC721 Transfer', value: 5 },
		{ name: 'Contract Creation', value: 6 }
	];

	const transactionTypeDesc = [
		[
			'- Calculated based on all transactions on the Manta Pacific Chain.',
			'- Avg Size per Txn: 140 bytes'
		],
		[
			'- An ETH Transfer is a transaction between two wallet addresses and does not involve any smart contract function call.',
			'- Avg Size per Txn: 80 bytes'
		],
		[
			'- A wallet address interacts with an ERC20 smart contract, transferring a certain amount of ERC20 tokens to another wallet address.',
			'- Avg Size per Txn: 120 bytes'
		],
		[
			'- Through an ERC20 Swap transaction, a wallet address uses one type of ERC20 token in exchange for another type of ERC20 token. Swap is a common action when users interact with DEX like Uniswap. ',
			'- Avg Size per Txn: 300 bytes'
		],
		[
			'- ERC721 Mint is an action in which a wallet address mints an NFT from an ERC721 smart contract.',
			'- Avg Size per Txn: 180 bytes'
		],
		[
			'- A wallet address interacts with an ERC721 smart contract call transfer function to transfer an NFT to another wallet address.',
			'- Avg Size per Txn: 145 bytes'
		],
		[
			'- A wallet address deploys a smart contract to the blockchain.',
			'- Avg Size per Txn: 500 bytes'
		]
	];

	const cumulativeCards = [
		{
			name: 'Total Celestia DA Fee',
			value: '--',
			percent: '',
			tooltip: '',
			percentColor: import.meta.env.VITE_MAIN_COLOR
		},
		{
			name: 'Estimated L1 DA Fee (Calldata)',
			value: '--',
			tooltip: '',
			color: import.meta.env.VITE_MAIN_COLOR
		},
		{
			name: 'Estimated L1 DA Fee (Blobs)',
			value: '--',
			tooltip: '',
			color: import.meta.env.VITE_MAIN_COLOR
		},
		{
			name: 'Total Transactions',
			value: '--'
		},
		{
			name: 'Total Data Size',
			value: '--'
		}
	];

	const yesterdayCards = [
		{
			name: 'Celestia DA Fee',
			value: '--',
			percent: '',
			tooltip: '',
			percentColor: import.meta.env.VITE_MAIN_COLOR
		},
		{
			name: 'Estimated L1 DA Fee (Calldata)',
			value: '--',
			tooltip: '',
			color: import.meta.env.VITE_MAIN_COLOR
		},
		{
			name: 'Estimated L1 DA Fee (Blobs)',
			value: '--',
			tooltip: '',
			color: import.meta.env.VITE_MAIN_COLOR
		},
		{
			name: 'Transactions',
			value: '--'
		},
		{
			name: 'Data Size',
			value: '--'
		}
	];

	const calculatedCards = [
		{
			name: 'Estimated Data Size',
			value: '--'
		},
		{
			name: 'Estimated L1 DA Fee (Calldata)',
			value: '--'
		},
		{
			name: 'Estimated L1 DA Fee (Blobs)',
			value: '--'
		},
		{
			name: 'Estimated Celestia DA fee',
			value: '--'
		}
	];

	let myChart: Chart;

	let fetchingDataChain: string | null;

	let selectedChain: string = $page.url.searchParams.get('chain') || 'all';

	const debounceCalculateData = createDebouncedRequest<{
		transactionCount: any;
		transactionType: any;
	}>(calculateData, 300);

	function handleCalculateChange() {
		debounceCalculateData({ transactionCount, transactionType });
	}

	function calculateData(
		query: { transactionCount: any; transactionType: string },
		signal: AbortSignal
	) {
		if (!(transactionType >= 0) || isNaN(Number(transactionCount)) || Number(transactionCount) <= 0)
			return Promise.resolve(null);

		calculating = true;

		return get<CalculatedDAFee>(
			`/v1/celestia/da_fee_calculate?transaction_count=${query.transactionCount}&transaction_type=${query.transactionType}`,
			{ signal }
		)
			.then((data) => {
				calculatedCards[0].value = formatBytes(data.estimate_data_size);
				calculatedCards[1].value = '$ ' + formatNumber(data.estimate_l1_da_fee_usd, 2);
				calculatedCards[2].value = '$ ' + formatNumber(data.estimate_l1_eip_4844_da_fee_usd, 2);
				calculatedCards[3].value = '$ ' + formatNumber(data.estimate_celestia_da_fee_usd, 2);
			})
			.finally(() => (calculating = false));
	}

	function fetchDataByChain(chainId: any) {
		if (fetchingDataChain) return;

		selectedChain = chainId;

		const newUrl = new URL($page.url);
		newUrl.searchParams.set('chain', chainId);
		window.history.pushState({}, '', newUrl.toString());

		fetchingDataChain = chainId;
		fetchData({ fetch, chain: chainId })
			.then((res) => {
				data = res;
				handleMetrics();
				handleChartData();
			})
			.finally(() => (fetchingDataChain = null));
	}

	function handleMetrics() {
		const totalSavingPercent =
			((data.metrics.total_l1_da_fee_usd - data.metrics.total_celestia_da_fee_usd) /
				data.metrics.total_l1_da_fee_usd) *
			100;

		cumulativeCards[0].value = '$ ' + formatNumber(data.metrics.total_celestia_da_fee_usd, 2);
		cumulativeCards[0].percent = formatNumber(totalSavingPercent, 2) + '%';
		cumulativeCards[1].value = '$ ' + formatNumber(data.metrics.total_celestia_da_fee_usd, 2);
		cumulativeCards[2].value = '$ ' + formatNumber(data.metrics.total_l1_eip_4844_da_fee_usd, 2);
		cumulativeCards[3].value = formatNumberToKMB(data.metrics.total_transaction_count);
		cumulativeCards[4].value = formatBytes(data.metrics.total_data_size);

		const yesterdaySavingPercent =
			((data.metrics.latest_l1_da_fee_usd - data.metrics.latest_estimate_celestia_da_fee_usd) /
				data.metrics.latest_l1_da_fee_usd) *
			100;

		yesterdayCards[0].value =
			'$ ' + formatNumber(data.metrics.latest_estimate_celestia_da_fee_usd, 2);
		yesterdayCards[0].percent = formatNumber(yesterdaySavingPercent, 2) + '%';
		yesterdayCards[1].value =
			'$ ' + formatNumber(data.metrics.latest_estimate_celestia_da_fee_usd, 2);
		yesterdayCards[2].value = '$ ' + formatNumber(data.metrics.latest_l1_eip_4844_da_fee_usd, 2);
		yesterdayCards[3].value = formatNumberToKMB(data.metrics.latest_transaction_count);
		yesterdayCards[4].value = formatBytes(data.metrics.latest_data_size);
	}

	function handleChartData() {
		const gradient = container.getContext('2d').createLinearGradient(0, 0, 0, 550);
		gradient.addColorStop(0, '#6AD9B6');
		gradient.addColorStop(1, 'rgba(133, 193, 233, 0)');

		const labels: any[] = [];
		const l1Values: any[] = [];
		const values4844: any[] = [];
		const expectedValues: any[] = [];

		data.data.forEach((item) => {
			labels.push(item.date);
			l1Values.push(item.transaction_fee_on_l1_usd);
			expectedValues.push(item.estimate_celestia_da_fee_usd);
			values4844.push(item.estimate_eip_4844_da_fee_usd);
		});

		if (myChart) {
			myChart.data.labels = labels;
			myChart.data.datasets[0].data = l1Values;
			myChart.data.datasets[1].data = expectedValues;
			myChart.data.datasets[2].data = values4844;

			myChart.update();
		} else {
			myChart = new Chart(container, {
				type: 'line',
				data: {
					labels: labels,
					datasets: [
						{
							label: 'Estimated L1 DA Fee with Calldata (USD)',
							data: l1Values,
							backgroundColor: (ctx) => {
								if (ctx.dataIndex === l1Values.length - 1) {
									return '#dddddd';
								}

								return '#766FFA';
							},
							fill: false,
							tension: 0,
							borderWidth: 2,
							segment: {
								borderDash: [5, 5],
								borderColor: (ctx) => {
									if (ctx.p1DataIndex === data.data.length - 1) {
										return '#dddddd';
									}

									return '#766FFA';
								}
							}
						},
						{
							label: 'Celestia DA Fee (USD)',
							data: expectedValues,
							backgroundColor: (ctx) => {
								if (ctx.dataIndex === expectedValues.length - 1) {
									return '#dddddd';
								}

								return '#00B573';
							},
							fill: false,
							tension: 0.1,
							borderWidth: 2,
							segment: {
								borderDash: (ctx) => {
									const isLastData = ctx.p1DataIndex === expectedValues.length - 1;
									return isLastData ? [5, 5] : undefined;
								},
								borderColor: (ctx) => {
									if (ctx.p1DataIndex === data.data.length - 1) {
										return '#cccccc';
									}

									return '#00B573';
								}
							}
						},
						{
							label: 'Estimated L1 DA Fee with Blobs (USD)',
							data: values4844,
							backgroundColor: (ctx) => {
								if (ctx.dataIndex === values4844.length - 1) {
									return '#dddddd';
								}

								return '#FEB700';
							},
							fill: false,
							tension: 0.1,
							borderWidth: 2,
							segment: {
								borderDash: (ctx) => {
									const isLastData = ctx.p1DataIndex === values4844.length - 1;
									return isLastData ? [5, 5] : undefined;
								},
								borderColor: (ctx) => {
									if (ctx.p1DataIndex === data.data.length - 1) {
										return '#cccccc';
									}

									return '#FEB700';
								}
							}
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					animations: {},
					transitions: {
						zoom: {
							animation: {
								duration: 1000,
								easing: 'easeOutCubic'
							}
						}
					},
					scales: {
						x: {
							grid: {
								display: false
							},
							border: {
								display: false
							},
							ticks: {
								maxRotation: 0,
								minRotation: 0,
								maxTicksLimit: 8,
								autoSkip: true
							}
						},
						y: {
							type: 'logarithmic',
							grid: {},
							ticks: {
								maxTicksLimit: 6,
								callback: (value) => formatNumberToKMB(Number(value), 1)
							},
							border: {
								display: false,
								dash: [5, 5, 5]
							}
						}
					},
					elements: {
						point: {
							radius: (ctx) => (ctx.dataIndex === data.data.length - 1 ? 3 : 0)
						}
					},
					layout: {
						padding: {
							top: 10,
							bottom: 20,
							left: 20,
							right: 20
						}
					},

					plugins: {
						legend: {
							display: true,
							labels: {
								usePointStyle: false,
								boxHeight: 2
							}
						},
						title: {
							display: false
						},
						tooltip: {
							enabled: true,
							mode: 'index',
							intersect: false
						}
					}
				}
			});
		}
	}

	onMount(() => handleMetrics());

	onMount(() => handleChartData());
</script>

<div>
	<div class="mb-5">
		<h1 class="text-xl font-medium">Select Chain</h1>
		<div
			class="mt-2 flex cursor-pointer items-center justify-start gap-x-5 overflow-x-auto whitespace-nowrap"
		>
			{#each chainList as chain}
				<button
					class="{fetchingDataChain ? 'cursor-not-allowed ' : 'cursor-pointer '} {selectedChain ===
					chain.id
						? 'border-[#7B2BF9] bg-white'
						: 'border-[#F5F5F5] bg-[#F5F5F5]'} relative flex min-w-fit items-center justify-start gap-x-2 rounded-full border px-2.5 py-2 transition-all hover:bg-white hover:shadow-sm"
					on:click={() => fetchDataByChain(chain.id)}
				>
					{#if chain.img}
						<img src={chain.img} alt={chain.name} class="h-6 w-6 rounded-full" />
					{/if}
					<span>{chain.name}</span>
					{#if fetchingDataChain === chain.id}
						<div
							class="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-full bg-white bg-opacity-90"
						>
							<Spinner size="5" color="purple" />
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<div class="flex flex-wrap items-center justify-between gap-2">
		<h1 class="text-xl font-medium">DA Fee Tracker</h1>
		<span class="text-sm text-black text-opacity-50">Last Updated: {data.last_updated_at}</span>
	</div>

	<div class="my-5">
		<div class="mb-2 font-semibold">Cumulative</div>

		<div class="grid grid-cols-1 gap-5 text-left md:grid-cols-2 lg:grid-cols-5">
			{#each cumulativeCards as item, i}
				<div
					class="{i <= 2
						? 'fee-related'
						: ''} relative flex flex-col items-start justify-center gap-y-2.5 rounded-lg border border-[#E6EBEF] p-4"
				>
					<div class="text-xs">
						{item.name}
					</div>
					<div class="text-base font-medium">
						<span style={'color:' + (item.color || 'inherit')}>{item.value}</span>
						{#if item.percent}
							<span style="color:{item.percentColor}">(-{item.percent})</span>
						{/if}
					</div>

					{#if i <= 2}
						<img
							src={CelestiaPng}
							class="absolute right-0 top-0 h-full w-auto p-2 opacity-20"
							alt=""
						/>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<div class="my-5">
		<div class="mb-2 font-semibold">Yesterday</div>
		<div class="grid grid-cols-1 gap-5 text-left md:grid-cols-2 lg:grid-cols-5">
			{#each yesterdayCards as item, i}
				<div
					class="{i <= 2
						? 'fee-related'
						: ''} relative flex flex-col items-start justify-center gap-y-2.5 rounded-lg border border-[#E6EBEF] p-4"
				>
					<div class="text-xs">
						{item.name}
					</div>
					<div class=" text-base font-medium">
						<span style={'color:' + (item.color || 'inherit')}>{item.value}</span>
						{#if item.percent}
							<span style="color:{item.percentColor}">(-{item.percent})</span>
						{/if}
					</div>

					{#if i <= 2}
						<img
							src={CelestiaPng}
							class="absolute right-0 top-0 h-full w-auto p-2 opacity-20"
							alt=""
						/>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<div class="relative h-[300px] rounded-lg border border-[#E6EBEF] px-2.5 md:h-[500px]">
		<div class="absolute right-2 top-2">
			<img src={InfoCircle} class="h-4 w-4" alt="" />
			<Tooltip>
				<div class="w-[340px] text-xs">The solid line represents the actual DA fee over time.</div>

				<div class="w-[340px] text-xs">
					The dashed line represents the estimated DA fee over time.
				</div>
			</Tooltip>
		</div>
		<canvas bind:this={container} />
	</div>

	<h1 class="mt-5 text-xl font-medium">DA Fee Calculate</h1>

	<div class="my-5">
		<div class="mb-2 font-semibold">Input</div>
		<div
			class="flex flex-col items-start justify-center gap-y-2.5 rounded-lg border border-[#E6EBEF] p-4"
		>
			<Label>
				<div class="mb-2">Transaction Type</div>
				<Select
					defaultClass="rounded-full w-[300px]"
					placeholder="Select"
					items={transactionTypes}
					bind:value={transactionType}
					on:change={handleCalculateChange}
				/>
			</Label>

			<div>
				{#each transactionTypeDesc[transactionType] || [] as desc}
					<p class=" text-sm text-black text-opacity-80">{desc}</p>
				{/each}
			</div>

			<Label>
				<div class="mb-2">Transaction Count</div>
				<Input
					type="number"
					placeholder="Transaction Count"
					class="h-10 w-[300px] rounded-full border-[rgba(0,0,0,0.3)]  bg-transparent text-black focus:border-main"
					bind:value={transactionCount}
					on:input={handleCalculateChange}
				/>
			</Label>
		</div>
	</div>

	<div class="my-5">
		<div class="mb-2 flex items-center justify-start gap-x-2 font-semibold">
			<span>Calculated</span>

			{#if calculating}
				<Spinner class="" size="4" />
			{/if}
		</div>
		<div class="grid grid-cols-1 gap-5 text-left md:grid-cols-2 lg:grid-cols-4">
			{#each calculatedCards as item}
				<div
					class="flex flex-col items-start justify-center gap-y-2.5 rounded-lg border border-[#E6EBEF] p-4"
				>
					<div class="text-xs">
						{item.name}
					</div>
					<div class=" text-base font-medium">{item.value}</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="text-sm text-black text-opacity-80">
		<p class="mb-2">* Estimation of data size is based on historical transactions</p>
		<p class="mb-2">* Celestia DA fee estimation is based on 1 $TIA per MB and current TIA price</p>
		<p class="mb-2">* L1 DA fee estimation is based on gas fee = 20 gwei and current ETH price</p>
	</div>
</div>

<style>
	.fee-related {
		border: 1px solid #dec9ff;
		background: linear-gradient(180deg, rgba(123, 43, 249, 0.05) 0%, rgba(123, 43, 249, 0) 123.3%);
	}
</style>
