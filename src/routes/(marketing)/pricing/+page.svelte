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
	<title>Pricing - Tadwin</title>
	<meta name="description" content="Simple, transparent pricing for Tadwin. Start free and upgrade when you need more. No hidden fees, cancel anytime." />
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
					<a href="/features" class="text-gray-600 hover:text-gray-900 transition">Features</a>
					<a href="/pricing" class="text-teal-600 font-semibold transition">Pricing</a>
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
	<section class="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
		<div class="max-w-4xl mx-auto text-center">
			<h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
				Simple, <span class="text-teal-400">transparent</span> pricing
			</h1>
			<p class="text-xl text-gray-600 mb-4">
				Start free and upgrade when you need more. No hidden fees, cancel anytime.
			</p>
			<p class="text-lg text-gray-500">
				All plans include 14-day free trial. No credit card required.
			</p>
		</div>
	</section>

	<!-- Pricing Cards -->
	<section class="py-12 px-4 sm:px-6 lg:px-8">
		<div class="max-w-7xl mx-auto">
			<div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
				<!-- Free Plan -->
			<div class="bg-white p-8 rounded-xl border-2 border-gray-200 hover:border-teal-300 transition">
					<h4 class="text-2xl font-bold text-gray-900 mb-2">Free</h4>
					<div class="mb-6">
						<span class="text-4xl font-bold text-gray-900">$0</span>
						<span class="text-gray-600">/month</span>
					</div>
					<p class="text-gray-600 mb-6">Perfect for personal note-taking</p>
					<ul class="space-y-4 mb-8">
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-600">1 workspace</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-600">Up to 100 notes</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-600">Unlimited categories</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-600">Basic search</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-600">Markdown editor</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-600">Mobile responsive</span>
						</li>
					</ul>
					<button onclick={handleGetStarted} class="w-full border-2 border-teal-400 text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition">
					{isLoggedIn ? 'Launch App' : 'Get Started Free'}
					</button>
				</div>

				<!-- Pro Plan -->
				<div class="bg-teal-400 p-8 rounded-xl shadow-sm transform scale-105 relative">
					<div class="absolute top-0 right-0 bg-yellow-400 text-gray-900 text-sm font-bold px-4 py-1 rounded-bl-lg rounded-tr-lg">
						POPULAR
					</div>
					<h4 class="text-2xl font-bold text-white mb-2">Pro</h4>
					<div class="mb-6">
						<span class="text-4xl font-bold text-white">$9</span>
						<span class="text-white opacity-80">/month</span>
					</div>
					<p class="text-teal-100 mb-6">For power users and professionals</p>
					<ul class="space-y-4 mb-8">
						<li class="flex items-start">
							<svg class="w-6 h-6 text-white opacity-80 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-white">Everything in Free</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-white opacity-80 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-white">Unlimited workspaces</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-white opacity-80 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-white">Unlimited notes</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-white opacity-80 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-white">Advanced search & filters</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-white opacity-80 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-white">Offline sync</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-white opacity-80 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-white">Version history</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-white opacity-80 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-white">Priority support</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-white opacity-80 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-white">Export to PDF & Markdown</span>
						</li>
					</ul>
					<button onclick={handleGetStarted} class="w-full bg-white text-teal-400 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
						{isLoggedIn ? 'Upgrade Now' : 'Start Free Trial'}
					</button>
				</div>

				<!-- Team Plan -->
			<div class="bg-white p-8 rounded-xl border-2 border-gray-200 hover:border-teal-300 transition">
					<h4 class="text-2xl font-bold text-gray-900 mb-2">Team</h4>
					<div class="mb-6">
						<span class="text-4xl font-bold text-gray-900">$29</span>
						<span class="text-gray-600">/month</span>
					</div>
					<p class="text-gray-600 mb-6">For teams and collaboration</p>
					<ul class="space-y-4 mb-8">
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-600">Everything in Pro</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-600">Up to 10 team members</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-600">Shared workspaces</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-600">Real-time collaboration</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-600">Admin controls & permissions</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-600">Activity logs & audit trail</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-600">24/7 priority support</span>
						</li>
						<li class="flex items-start">
							<svg class="w-6 h-6 text-green-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
							</svg>
							<span class="text-gray-600">Custom integrations</span>
						</li>
					</ul>
					<button onclick={handleGetStarted} class="w-full border-2 border-teal-400 text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition">
						Contact Sales
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- FAQ Section -->
	<section class="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
		<div class="max-w-4xl mx-auto">
			<h2 class="text-4xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
			
			<div class="space-y-6">
				<div class="bg-white p-6 rounded-lg shadow-sm">
					<h3 class="text-xl font-semibold text-gray-900 mb-2">Do I need a credit card for the free trial?</h3>
					<p class="text-gray-600">No! You can start using Tadwin for free without providing any payment information. When you're ready to upgrade, we'll ask for payment details.</p>
				</div>

				<div class="bg-white p-6 rounded-lg shadow-sm">
					<h3 class="text-xl font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
					<p class="text-gray-600">Yes, you can cancel your subscription at any time. Your subscription will remain active until the end of your billing period.</p>
				</div>

				<div class="bg-white p-6 rounded-lg shadow-sm">
					<h3 class="text-xl font-semibold text-gray-900 mb-2">What happens to my data if I downgrade?</h3>
					<p class="text-gray-600">Your data is never deleted. If you downgrade, you'll have read-only access to content that exceeds your plan limits until you upgrade again or reduce your usage.</p>
				</div>

				<div class="bg-white p-6 rounded-lg shadow-sm">
					<h3 class="text-xl font-semibold text-gray-900 mb-2">Do you offer annual billing?</h3>
					<p class="text-gray-600">Yes! Save 20% with annual billing. Contact us for details about annual plans.</p>
				</div>

				<div class="bg-white p-6 rounded-lg shadow-sm">
					<h3 class="text-xl font-semibold text-gray-900 mb-2">Is my data secure?</h3>
					<p class="text-gray-600">Absolutely. We use industry-standard encryption, secure servers, and regular backups to keep your data safe and private.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="py-20 px-4 sm:px-6 lg:px-8">
		<div class="max-w-4xl mx-auto text-center">
			<h3 class="text-4xl font-bold text-gray-900 mb-6">Ready to get started?</h3>
			<p class="text-xl text-gray-600 mb-8">
				Start your 14-day free trial today. No credit card required.
			</p>
			<button onclick={handleGetStarted} class="bg-teal-400 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-teal-500 transition">
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
