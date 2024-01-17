<script lang="ts">
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
	import type { CalculatedDAFee, DaFeeTracker } from './+page';

	import InfoCircle from '$lib/assets/info-circle.svg';

	export let data: DaFeeTracker;

	let container: any;

	let transactionType: number;
	let transactionCount: number;

	let calculating = false;

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
			name: 'Estimated Savings',
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
			name: 'Estimated Savings',
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
			name: 'Estimated L1 DA Fee',
			value: '--'
		},
		{
			name: 'Estimated Celestia DA fee',
			value: '--'
		}
	];

	let myChart: any;

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
			`/v1/explorer/da_fee_calculate?transaction_count=${query.transactionCount}&transaction_type=${query.transactionType}`,
			{ signal }
		)
			.then((data) => {
				calculatedCards[0].value = formatBytes(data.estimate_data_size);
				calculatedCards[1].value = '$ ' + formatNumber(data.estimate_l1_da_fee_usd, 2);
				calculatedCards[2].value = '$ ' + formatNumber(data.estimate_celestia_da_fee_usd, 2);
			})
			.finally(() => (calculating = false));
	}

	onMount(() => {
		const totalSavingPercent =
			((data.metrics.total_l1_da_fee_usd - data.metrics.total_celestia_da_fee_usd) /
				data.metrics.total_l1_da_fee_usd) *
			100;

		cumulativeCards[0].value = '$ ' + formatNumber(data.metrics.total_celestia_da_fee_usd, 2);
		cumulativeCards[0].percent = formatNumber(totalSavingPercent, 2) + '%';
		cumulativeCards[1].value =
			'$ ' +
			formatNumber(data.metrics.total_l1_da_fee_usd - data.metrics.total_celestia_da_fee_usd, 2);
		cumulativeCards[2].value = formatNumberToKMB(data.metrics.total_transaction_count);
		cumulativeCards[3].value = formatBytes(data.metrics.total_data_size);

		const yesterdaySavingPercent =
			((data.metrics.latest_l1_da_fee_usd - data.metrics.latest_estimate_celestia_da_fee_usd) /
				data.metrics.latest_l1_da_fee_usd) *
			100;

		yesterdayCards[0].value =
			'$ ' + formatNumber(data.metrics.latest_estimate_celestia_da_fee_usd, 2);
		yesterdayCards[0].percent = formatNumber(yesterdaySavingPercent, 2) + '%';
		yesterdayCards[1].value =
			'$ ' +
			formatNumber(
				data.metrics.latest_l1_da_fee_usd - data.metrics.latest_estimate_celestia_da_fee_usd,
				2
			);
		yesterdayCards[2].value = formatNumberToKMB(data.metrics.latest_transaction_count);
		yesterdayCards[3].value = formatBytes(data.metrics.latest_data_size);
	});

	onMount(() => {
		const gradient = container.getContext('2d').createLinearGradient(0, 0, 0, 550);
		gradient.addColorStop(0, '#6AD9B6');
		gradient.addColorStop(1, 'rgba(133, 193, 233, 0)');

		const labels: any[] = [];
		const l1Values: any[] = [];
		const expectedValues: any[] = [];

		data.data.forEach((item) => {
			labels.push(item.date);
			l1Values.push(item.transaction_fee_on_l1_usd);
			expectedValues.push(item.estimate_celestia_da_fee_usd);
		});

		myChart = new Chart(container, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [
					{
						label: 'Estimated L1 Data Fee (USD)',
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
							if (ctx.dataIndex === l1Values.length - 1) {
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
	});
</script>

<div>
	<div class="flex flex-wrap items-center justify-between gap-2">
		<h1 class="text-xl font-medium">DA Fee Tracker</h1>
		<span class="text-sm text-black text-opacity-50">Last Updated: {data.last_updated_at}</span>
	</div>

	<div class="my-5">
		<div class="mb-2 font-semibold">Cumulative</div>
		<div class="mb-2 text-sm text-main">
			Integrated with Celestia since Dec. 16, 2023, calculations start from this date.
		</div>
		<div class="grid grid-cols-1 gap-5 text-left md:grid-cols-2 lg:grid-cols-4">
			{#each cumulativeCards as item}
				<div
					class="flex flex-col items-start justify-center gap-y-2.5 rounded-lg bg-white p-4 shadow-md"
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
				</div>
			{/each}
		</div>
	</div>

	<div class="my-5">
		<div class="mb-2 font-semibold">Yesterday</div>
		<div class="grid grid-cols-1 gap-5 text-left md:grid-cols-2 lg:grid-cols-4">
			{#each yesterdayCards as item}
				<div
					class="flex flex-col items-start justify-center gap-y-2.5 rounded-lg bg-white p-4 shadow-md"
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
				</div>
			{/each}
		</div>
	</div>

	<div class="relative h-[300px] rounded-lg bg-white px-2.5 shadow-md md:h-[500px]">
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
			class="flex flex-col items-start justify-center gap-y-2.5 rounded-lg bg-white p-4 shadow-md"
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
					class="flex flex-col items-start justify-center gap-y-2.5 rounded-lg bg-white p-4 shadow-md"
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
