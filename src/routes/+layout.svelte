<script lang="ts">
	import Celestia from '$lib/assets/celestia.png';
	import Logo from '$lib/assets/social-scan-logo.png';
	import { BigNumber } from 'bignumber.js';
	import { onMount } from 'svelte';
	import { fetchStatsData, type Stats } from './page';

	import '../app.css';

	let stats: Stats;

	onMount(() =>
		fetchStatsData({ fetch }).then((data) => {
			stats = {
				...data,
				native_token_price_diff: new BigNumber(data.native_token_price_diff)
					.multipliedBy(1030)
					.toNumber()
			};
		})
	);
</script>

<svelte:head>
	<title>DA Fee Tracker | Celestia</title>
	<meta property="og:title" content="DA Fee Tracker" />
	<meta name="twitter:title" content="DA Fee Tracker" />
</svelte:head>

<div>
	<header>
		<div class="container mx-auto p-4 text-xs sm:px-9 md:py-5 md:text-base">
			<div class="flex w-full flex-wrap items-center justify-between gap-x-5 gap-y-5">
				<div class="flex items-center justify-start gap-x-2">
					<img src={Celestia} class="h-10 w-10" alt="" />
					<span class=" text-lg font-bold">Celestia Agent</span>
				</div>

				<div class="flex items-center justify-start gap-x-2.5 text-xs font-medium">
					{#if !!stats}
						<div>
							ETH: ${stats.native_token_price}
							<span
								class:text-success={stats.native_token_price_diff > 0}
								class:text-error={stats.native_token_price_diff < 0}
							>
								({#if stats.native_token_price_diff >= 0}
									+{stats.native_token_price_diff}%
								{:else}
									{stats.native_token_price_diff}%
								{/if})
							</span>
						</div>

						<!-- <div class="text-main">
							<img
								src="/images/gas-station.svg"
								class="inline-block h-5 w-5 align-middle"
								alt="Gas Station"
							/>
							<span>{stats.gas_fee}</span>
						</div> -->
					{/if}
				</div>
			</div>
		</div>

		<div class="h-[1px] w-full bg-black bg-opacity-10" />
	</header>

	<div class="container mx-auto p-5 md:p-10">
		<slot />
	</div>

	<footer>
		<div class="h-[1px] w-full bg-black bg-opacity-10" />

		<div class="container mx-auto p-4 text-xs sm:px-9 md:py-5 md:text-base">
			<div class="flex w-full flex-wrap items-start justify-between gap-x-5 gap-y-5">
				<div>
					<div class="flex flex-wrap items-center justify-start gap-x-8 gap-y-5 sm:gap-x-2">
						<span>
							<span>Built by </span>
							<a href="https://socialscan.io">
								<img class="inline-block h-6" src={Logo} alt="w3w.ai" />
							</a>
						</span>
					</div>
				</div>
			</div>
		</div>
	</footer>
</div>
