<script lang="ts">
	import { goto } from '$app/navigation';

	let { data } = $props();
	let isLoggedIn = $state(false);

	$effect(() => {
		isLoggedIn = !!data?.user;
	});

	function handleGetStarted() {
		if (isLoggedIn) {
			goto('/app');
		} else {
			goto('/register');
		}
	}
</script>

<svelte:head>
	<title>Features - Tadwin</title>
	<meta name="description" content="Discover all the powerful features that make Tadwin the perfect markdown-first note-taking app for developers, writers, and knowledge workers." />
</svelte:head>

<div class="min-h-screen bg-white">
	<!-- Navigation -->
	<nav class="border-b border-gray-200 bg-white/80 backdrop-blur-md fixed w-full top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<div class="flex items-center">
					<a href="/" class="text-2xl font-bold text-teal-400">Tadwin</a>
				</div>
				<div class="hidden md:flex items-center space-x-8">
					<a href="/features" class="text-teal-600 font-semibold transition">Features</a>
					<a href="/pricing" class="text-gray-600 hover:text-gray-900 transition">Pricing</a>
					<a href="/about" class="text-gray-600 hover:text-gray-900 transition">About</a>
				{#if !isLoggedIn}
					<a href="/login" class="text-gray-600 hover:text-gray-900 transition">Sign In</a>
				{/if}
				<button onclick={handleGetStarted} class="bg-teal-400 text-white px-6 py-2 rounded-lg hover:bg-teal-500 transition">
					{isLoggedIn ? 'Launch App' : 'Get Started'}
					</button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Hero Section -->
	<section class="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
		<div class="max-w-7xl mx-auto text-center">
			<h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
				Powerful Features for <span class="text-teal-400">Productive Writing</span>
			</h1>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto">
				Everything you need to capture, organize, and find your notes. Built with modern technology for a seamless experience.
			</p>
		</div>
	</section>

	<!-- Detailed Features -->
	<section class="py-20 px-4 sm:px-6 lg:px-8">
		<div class="max-w-7xl mx-auto">
			<!-- Feature 1 -->
			<div class="mb-20 grid md:grid-cols-2 gap-12 items-center">
				<div>
					<div class="inline-block bg-teal-100 text-teal-400 px-4 py-1 rounded-full text-sm font-semibold mb-4">
						EDITOR
					</div>
					<h2 class="text-4xl font-bold text-gray-900 mb-4">Markdown-First Editor</h2>
					<p class="text-lg text-gray-600 mb-6">
						Write naturally with full markdown support. Our editor understands your workflow and gets out of your way. 
						Format text, create lists, add code blocks, and insert links with simple markdown syntax.
					</p>
					<ul class="space-y-3">
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-700">Live preview as you type</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-700">Syntax highlighting for code blocks</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-700">Keyboard shortcuts for power users</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-700">Tables, task lists, and more</span>
						</li>
					</ul>
				</div>
				<div class="bg-gray-100 rounded-xl p-8 h-96 flex items-center justify-center">
					<p class="text-gray-500 text-center">Editor Preview</p>
				</div>
			</div>

			<!-- Feature 2 -->
			<div class="mb-20 grid md:grid-cols-2 gap-12 items-center">
				<div class="order-2 md:order-1 bg-gray-100 rounded-xl p-8 h-96 flex items-center justify-center">
					<p class="text-gray-500 text-center">Workspace Organization</p>
				</div>
				<div class="order-1 md:order-2">
					<div class="inline-block bg-teal-100 text-teal-400 px-4 py-1 rounded-full text-sm font-semibold mb-4">
						ORGANIZATION
					</div>
					<h2 class="text-4xl font-bold text-gray-900 mb-4">Workspaces & Categories</h2>
					<p class="text-lg text-gray-600 mb-6">
						Keep your notes organized with flexible workspaces and categories. Separate personal notes from work projects, 
						or organize by topic, client, or any system that works for you.
					</p>
					<ul class="space-y-3">
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-700">Unlimited workspaces (Pro)</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-700">Nested categories for better structure</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-700">Pin important notes to the top</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-700">Archive and trash functionality</span>
						</li>
					</ul>
				</div>
			</div>

			<!-- Feature 3 -->
			<div class="mb-20 grid md:grid-cols-2 gap-12 items-center">
				<div>
					<div class="inline-block bg-teal-100 text-teal-400 px-4 py-1 rounded-full text-sm font-semibold mb-4">
						SEARCH
					</div>
					<h2 class="text-4xl font-bold text-gray-900 mb-4">Lightning-Fast Search</h2>
					<p class="text-lg text-gray-600 mb-6">
						Find anything instantly with our powerful full-text search. Search across all notes, workspaces, and categories 
						to quickly locate the information you need.
					</p>
					<ul class="space-y-3">
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-700">Full-text search across all content</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-700">Filter by workspace and category</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-700">Keyboard shortcuts for quick access</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-700">Recent searches and suggestions</span>
						</li>
					</ul>
				</div>
				<div class="bg-gray-100 rounded-xl p-8 h-96 flex items-center justify-center">
					<p class="text-gray-500 text-center">Search Interface</p>
				</div>
			</div>

			<!-- Feature 4 -->
			<div class="mb-20 grid md:grid-cols-2 gap-12 items-center">
				<div class="order-2 md:order-1 bg-gray-100 rounded-xl p-8 h-96 flex items-center justify-center">
					<p class="text-gray-500 text-center">Offline Sync</p>
				</div>
				<div class="order-1 md:order-2">
					<div class="inline-block bg-teal-100 text-teal-400 px-4 py-1 rounded-full text-sm font-semibold mb-4">
						SYNC
					</div>
					<h2 class="text-4xl font-bold text-gray-900 mb-4">Offline Support & Sync</h2>
					<p class="text-lg text-gray-600 mb-6">
						Work anywhere, anytime. Edit notes offline and they'll automatically sync when you're back online. 
						Smart conflict resolution ensures your work is never lost.
					</p>
					<ul class="space-y-3">
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-700">Edit notes without internet connection</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-700">Automatic sync when online</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-700">Intelligent conflict resolution</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-700">Version history and recovery</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="py-20 px-4 sm:px-6 lg:px-8 bg-teal-400">
		<div class="max-w-4xl mx-auto text-center">
			<h3 class="text-4xl font-bold text-white mb-6">Ready to experience these features?</h3>
			<p class="text-xl text-white/90 mb-8">
				Start your free trial today and see why thousands choose Tadwin.
			</p>
			<button onclick={handleGetStarted} class="bg-white text-teal-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition">
				{isLoggedIn ? 'Launch App' : 'Start Free Trial'}
			</button>
		</div>
	</section>

	<!-- Footer -->
	<footer class="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
		<div class="max-w-7xl mx-auto">
			<div class="grid md:grid-cols-4 gap-8 mb-8">
				<div>
					<h4 class="text-white font-bold text-lg mb-4">Tadwin</h4>
					<p class="text-sm">Your markdown-first note-taking companion.</p>
				</div>
				<div>
					<h5 class="text-white font-semibold mb-4">Product</h5>
					<ul class="space-y-2 text-sm">
						<li><a href="/features" class="hover:text-white transition">Features</a></li>
						<li><a href="/pricing" class="hover:text-white transition">Pricing</a></li>
						<li><a href="/register" class="hover:text-white transition">Sign Up</a></li>
					</ul>
				</div>
				<div>
					<h5 class="text-white font-semibold mb-4">Company</h5>
					<ul class="space-y-2 text-sm">
						<li><a href="/about" class="hover:text-white transition">About</a></li>
						<li><a href="/blog" class="hover:text-white transition">Blog</a></li>
						<li><a href="/contact" class="hover:text-white transition">Contact</a></li>
					</ul>
				</div>
				<div>
					<h5 class="text-white font-semibold mb-4">Legal</h5>
					<ul class="space-y-2 text-sm">
						<li><a href="/privacy" class="hover:text-white transition">Privacy Policy</a></li>
						<li><a href="/terms" class="hover:text-white transition">Terms of Service</a></li>
					</ul>
				</div>
			</div>
			<div class="border-t border-gray-800 pt-8 text-center text-sm">
				<p>&copy; 2025 Tadwin. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
</style>
