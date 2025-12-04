<script lang="ts">
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores';

	let email = $state('');
	let password = $state('');
	let name = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleRegister(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, name })
			});

			const data = await response.json();

			if (response.ok) {
				user.set(data.user);
				goto('/app');
			} else {
				error = data.error || 'Registration failed';
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
			<h1 class="text-3xl font-bold text-gray-900 text-center mb-2">Create Account</h1>
			<p class="text-gray-600 text-center mb-8">Start taking markdown notes</p>

			{#if error}
				<div class="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">
					{error}
				</div>
			{/if}

			<form onsubmit={handleRegister}>
				<div class="mb-4">
					<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
						Name (optional)
					</label>
					<input
						id="name"
						type="text"
						bind:value={name}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
						placeholder="Your name"
					/>
				</div>

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

				<div class="mb-6">
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

				<button
					type="submit"
					disabled={loading}
				class="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{loading ? 'Creating account...' : 'Create Account'}
				</button>
			</form>

			<p class="mt-6 text-center text-gray-600">
				Already have an account?
				<a href="/login" class="text-primary hover:text-primary-hover font-medium">Log in</a>
			</p>
		</div>
	</div>
</div>
