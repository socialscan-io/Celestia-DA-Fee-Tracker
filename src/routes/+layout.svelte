<script>
	import Logo from '$lib/assets/social-scan-logo.png';
	import '../app.css';
</script>

<svelte:head>
	<title>DA Fee Tracker | Manta</title>
	<meta property="og:title" content="DA Fee Tracker" />
	<meta name="twitter:title" content="DA Fee Tracker" />
</svelte:head>

<div>
	<div class="container mx-auto p-5 md:p-10">
		<slot />
	</div>

	<footer>
		<div class="h-[1px] w-full bg-black bg-opacity-10" />

		<div class="container mx-auto px-4 pb-5 text-xs sm:px-9 md:py-5 md:text-base">
			<div class="flex w-full flex-wrap items-start justify-between gap-x-5 gap-y-5">
				<div>
					<div class="flex flex-wrap items-center justify-start gap-x-8 gap-y-5 sm:gap-x-2">
						<span>
							Built by
							<a href="https://socialscan.io">
								<img class="inline-block h-6" src={Logo} alt="w3w.ai" />
							</a>
						</span>

						<div class="divider hidden sm:block" />

						<span>
							Powered by

							<a href="/">
								<img
									class="inline-block h-6"
									src="https://pacific-bridge.manta.network/manta-pacific-logo.svg"
									alt="Manta Pacific"
								/>
							</a>
						</span>
					</div>
				</div>
			</div>
		</div>
	</footer>
</div>
