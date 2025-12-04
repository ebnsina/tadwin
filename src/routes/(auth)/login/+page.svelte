<script lang="ts">
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores';

	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let error = $state('');
	let loading = $state(false);

	async function handleLogin(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, rememberMe })
			});

			const data = await response.json();

			if (response.ok) {
				user.set(data.user);
				goto('/app');
			} else {
				error = data.error || 'Login failed';
			}
		} catch (err) {
			error = 'An error occurred. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
	<div class="max-w-md w-full">
		<div class="bg-white rounded-lg shadow-sm p-8">
			<h1 class="text-3xl font-bold text-gray-900 text-center mb-2">Welcome Back</h1>
			<p class="text-gray-600 text-center mb-8">Sign in to your account</p>

			{#if error}
				<div class="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">
					{error}
				</div>
			{/if}

			<form onsubmit={handleLogin}>
				<div class="mb-4">
					<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
						Email
					</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						required
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
						placeholder="you@example.com"
					/>
				</div>

				<div class="mb-4">
					<label for="password" class="block text-sm font-medium text-gray-700 mb-2">
						Password
					</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						required
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
						placeholder="••••••••"
					/>
				</div>

				<div class="mb-6">
					<label class="flex items-center">
						<input
							type="checkbox"
							bind:checked={rememberMe}
							class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
						/>
						<span class="ml-2 text-sm text-gray-700">Remember me</span>
					</label>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{loading ? 'Signing in...' : 'Sign In'}
				</button>
			</form>

			<p class="mt-6 text-center text-gray-600">
				Don't have an account?
				<a href="/register" class="text-primary hover:text-primary-hover font-medium">Sign up</a>
			</p>
		</div>
	</div>
</div>
