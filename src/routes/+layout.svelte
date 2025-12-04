<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	
	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#if data?.meta}
		<title>{data.meta.title}</title>
		<meta name="description" content={data.meta.description} />
		<meta name="keywords" content={data.meta.keywords} />
		<meta name="author" content={data.meta.author} />
		
		<!-- Open Graph -->
		<meta property="og:title" content={data.meta.title} />
		<meta property="og:description" content={data.meta.description} />
		<meta property="og:image" content={data.meta.ogImage} />
		<meta property="og:url" content={data.meta.ogUrl} />
		
		<!-- Twitter Card -->
		<meta name="twitter:card" content={data.meta.twitterCard} />
		<meta name="twitter:site" content={data.meta.twitterSite} />
		<meta name="twitter:title" content={data.meta.title} />
		<meta name="twitter:description" content={data.meta.description} />
		<meta name="twitter:image" content={data.meta.ogImage} />
		
		<!-- Canonical -->
		<link rel="canonical" href={data.meta.canonical} />
	{/if}
</svelte:head>

{@render children()}
