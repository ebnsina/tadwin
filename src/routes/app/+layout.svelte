<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { slide, fade } from 'svelte/transition';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import {
		user,
		workspaces,
		currentWorkspace,
		categories,
		notes,
		sidebarOpen,
		searchQuery,
		selectedCategoryId,
		showArchived,
		showTrashed,
		isOffline,
		syncQueue
	} from '$lib/stores';
	import { processSyncQueue } from '$lib/sync';

	let { data, children } = $props();
	let showWorkspaceModal = $state(false);
	let showRenameModal = $state(false);
	let showDeleteModal = $state(false);
	let showWorkspaceDropdown = $state(false);
	let newWorkspaceName = $state('');
	let renameWorkspaceName = $state('');
	let deleteWorkspaceName = $state('');
	let isCreatingWorkspace = $state(false);
	let isRenamingWorkspace = $state(false);
	let isDeletingWorkspace = $state(false);
	let categoriesCollapsed = $state(false);
	let bottomNavCollapsed = $state(false);
	let currentTheme = $state<'teal' | 'orange' | 'pink' | 'lime'>('teal');
	let workspaceError = $state('');
	let showUpgradePrompt = $state(false);

	// Set user from server data
	$effect(() => {
		if (data?.user) {
			user.set(data.user);
		}
	});

	// Load theme from localStorage on mount
	onMount(async () => {
		const savedTheme = localStorage.getItem('tadwin-theme') as 'teal' | 'orange' | 'pink' | 'lime' | null;
		if (savedTheme) {
			currentTheme = savedTheme;
			applyTheme(savedTheme);
		}
		
		await loadWorkspaces();
		// Start sync process
		processSyncQueue();
	});

	// Close dropdown when clicking outside
	$effect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (!target.closest('.workspace-dropdown-container')) {
				showWorkspaceDropdown = false;
			}
		};
		if (typeof document !== 'undefined') {
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
	});

	// Reload notes when filter changes
	$effect(() => {
		if ($currentWorkspace) {
			loadNotes($currentWorkspace.id);
		}
	});

	function applyTheme(theme: 'teal' | 'orange' | 'pink' | 'lime') {
		if (typeof document !== 'undefined') {
			if (theme === 'teal') {
				document.documentElement.removeAttribute('data-theme');
			} else {
				document.documentElement.setAttribute('data-theme', theme);
			}
		}
	}

	function changeTheme(theme: 'teal' | 'orange' | 'pink' | 'lime') {
		currentTheme = theme;
		applyTheme(theme);
		localStorage.setItem('tadwin-theme', theme);
	}

	async function loadWorkspaces() {
		const response = await fetch('/api/workspaces');
		const data = await response.json();
		if (response.ok) {
			workspaces.set(data.workspaces);
			if (data.workspaces.length > 0 && !$currentWorkspace) {
				currentWorkspace.set(data.workspaces[0]);
				await loadWorkspaceData(data.workspaces[0].id);
			}
		}
	}

	async function loadWorkspaceData(workspaceId: string) {
		// Load categories
		const catResponse = await fetch(`/api/workspaces/${workspaceId}/categories`);
		const catData = await catResponse.json();
		if (catResponse.ok) {
			categories.set(catData.categories);
		}

		// Load notes
		await loadNotes(workspaceId);
	}

	async function loadNotes(workspaceId: string) {
		const params = new URLSearchParams();
		if ($selectedCategoryId) params.set('categoryId', $selectedCategoryId);
		if ($searchQuery) params.set('search', $searchQuery);
		if ($showArchived) params.set('archived', 'true');
		if ($showTrashed) params.set('trashed', 'true');

		const response = await fetch(`/api/workspaces/${workspaceId}/notes?${params}`);
		const data = await response.json();
		if (response.ok) {
			notes.set(data.notes);
		}
	}

	async function handleWorkspaceChange(workspace: any) {
		currentWorkspace.set(workspace);
		selectedCategoryId.set(null);
		await loadWorkspaceData(workspace.id);
	}

	async function createWorkspace() {
		if (!newWorkspaceName.trim() || isCreatingWorkspace) return;

		isCreatingWorkspace = true;
		workspaceError = '';
		try {
			const response = await fetch('/api/workspaces', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: newWorkspaceName })
			});

			const responseData = await response.json();

			if (response.ok) {
				await loadWorkspaces();
				currentWorkspace.set(responseData.workspace);
				await loadWorkspaceData(responseData.workspace.id);
				showWorkspaceModal = false;
				newWorkspaceName = '';
			} else {
				if (responseData.code === 'WORKSPACE_LIMIT_REACHED') {
					showUpgradePrompt = true;
				} else {
					workspaceError = responseData.message || 'Failed to create workspace';
				}
			}
		} catch (error) {
			workspaceError = 'Failed to create workspace';
		} finally {
			isCreatingWorkspace = false;
		}
	}

	function openRenameModal() {
		if ($currentWorkspace) {
			renameWorkspaceName = $currentWorkspace.name;
			showRenameModal = true;
		}
	}

	function openDeleteModal() {
		showWorkspaceDropdown = false;
		deleteWorkspaceName = '';
		showDeleteModal = true;
	}

	async function confirmDeleteWorkspace() {
		if (!$currentWorkspace || isDeletingWorkspace) return;
		if (deleteWorkspaceName !== $currentWorkspace.name) return;

		isDeletingWorkspace = true;
		try {
			const response = await fetch(`/api/workspaces/${$currentWorkspace.id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				showDeleteModal = false;
				deleteWorkspaceName = '';
				// Reload workspaces and select the first one
				await loadWorkspaces();
				if ($workspaces.length > 0) {
					currentWorkspace.set($workspaces[0]);
					await loadWorkspaceData($workspaces[0].id);
				} else {
					currentWorkspace.set(null);
				}
			}
		} catch (error) {
			console.error('Failed to delete workspace:', error);
		} finally {
			isDeletingWorkspace = false;
		}
	}

	function openRenameModalFromDropdown() {
		showWorkspaceDropdown = false;
		openRenameModal();
	}

	async function renameWorkspace() {
		if (!renameWorkspaceName.trim() || isRenamingWorkspace || !$currentWorkspace) return;

		isRenamingWorkspace = true;
		try {
			const response = await fetch(`/api/workspaces/${$currentWorkspace.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: renameWorkspaceName })
			});

			if (response.ok) {
				await loadWorkspaces();
				const updated = $workspaces.find(w => w.id === $currentWorkspace?.id);
				if (updated) {
					currentWorkspace.set(updated);
				}
				showRenameModal = false;
				renameWorkspaceName = '';
			}
		} finally {
			isRenamingWorkspace = false;
		}
	}

	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		user.set(null);
		goto('/login');
	}

</script>

<div class="flex h-screen bg-slate-50 overflow-hidden">
	<!-- Sidebar -->
	{#if $sidebarOpen}
	<aside 
		transition:slide={{ duration: 300, axis: 'x' }}
		class="w-72 bg-white border-r border-slate-200 flex flex-col"
		class:lg:flex={true}
	>
		<!-- Header -->
		<div class="p-3 md:p-4 border-b border-slate-200 bg-gradient-conic relative">
			<div class="relative">
				<div class="flex items-center justify-between mb-3">
					<div class="flex items-center gap-1.5">
						<Tooltip text="Tadwīn (تدوين) - Arabic for: writing, recording, documenting">
							<h1 class="text-lg md:text-xl font-extrabold text-primary tracking-tight cursor-help">Tadwin</h1>
						</Tooltip>
						{#if data?.user?.plan === 'free'}
							<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-white/90 text-slate-700">
								Free
							</span>
						{:else if data?.user?.plan === 'pro'}
							<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-white/90 text-teal-700">
								Pro
							</span>
						{:else if data?.user?.plan === 'team'}
							<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-white/90 text-purple-700">
								Team
							</span>
						{/if}
					</div>
					<button
						onclick={() => sidebarOpen.set(false)}
						class="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
						aria-label="Close sidebar"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
							<line x1="9" x2="9" y1="3" y2="21"/>
						</svg>
					</button>
				</div>

				<!-- Workspace Selector -->
				<div class="space-y-2.5">
					<div class="flex gap-1.5 relative workspace-dropdown-container">
						<select
							onchange={(e) => {
								const ws = $workspaces.find((w) => w.id === e.currentTarget.value);
								if (ws) handleWorkspaceChange(ws);
							}}
							value={$currentWorkspace?.id || ''}
							class="flex-1 px-3 py-2 bg-white/80 backdrop-blur-md border-0 rounded-lg text-sm font-semibold text-slate-900 focus:ring-0 focus:bg-white transition-all shadow-sm"
						>
							{#each $workspaces as workspace}
								<option value={workspace.id}>{workspace.name}</option>
							{/each}
						</select>
						<button
							onclick={() => showWorkspaceDropdown = !showWorkspaceDropdown}
							class="px-2.5 py-2 bg-white/80 hover:bg-white backdrop-blur-md text-slate-900 rounded-lg transition-all shadow-sm"
							aria-label="Workspace actions"
							aria-expanded={showWorkspaceDropdown}
						>
							<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
							</svg>
						</button>
						
						<!-- Dropdown Menu -->
						{#if showWorkspaceDropdown}
							<div 
								transition:slide={{ duration: 200 }}
								class="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
								role="menu"
							>
								<button
									onclick={openRenameModalFromDropdown}
									class="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
									role="menuitem"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
									</svg>
									Rename
								</button>
								<button
									onclick={openDeleteModal}
									class="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
									role="menuitem"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
									Delete
								</button>
							</div>
						{/if}
					</div>
					
					<button
						onclick={() => showWorkspaceModal = true}
						class="w-full px-3 py-2 bg-white/80 hover:bg-white backdrop-blur-md text-slate-900 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
						New Workspace
					</button>
				</div>
			</div>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 overflow-y-auto p-2 md:p-4">
			<div class="space-y-1">
				<button
					onclick={() => {
						selectedCategoryId.set(null);
						showArchived.set(false);
						showTrashed.set(false);
					}}
					class="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs md:text-sm font-semibold transition-all"
					class:bg-primary-bg={!$selectedCategoryId && !$showArchived && !$showTrashed}
					class:text-primary={!$selectedCategoryId && !$showArchived && !$showTrashed}
				>
					<div class="flex items-center gap-3">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						All Notes
					</div>
				</button>

				{#if $categories.length > 0}
					<div class="pt-6">
						<div class="flex items-center justify-between px-3 mb-1.5">
							<h3 class="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
								Categories
							</h3>
							<button
								onclick={() => categoriesCollapsed = !categoriesCollapsed}
								class="text-slate-400 hover:text-slate-600 transition-colors"
								aria-label={categoriesCollapsed ? 'Expand categories' : 'Collapse categories'}
							>
								<svg 
									class="w-4 h-4 transition-transform duration-200"
									class:rotate-180={categoriesCollapsed}
									fill="none" 
									stroke="currentColor" 
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
							</button>
						</div>
						{#if !categoriesCollapsed}
						<div transition:slide={{ duration: 200 }}>
							{#each $categories as category}
								<button
									onclick={() => {
										selectedCategoryId.set(category.id);
										showArchived.set(false);
										showTrashed.set(false);
									}}
									class="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs md:text-sm font-semibold flex items-center transition-all"
									class:bg-primary-bg={$selectedCategoryId === category.id}
									class:text-primary={$selectedCategoryId === category.id}
								>
									{#if category.color}
										<span
												class="w-3 h-3 rounded-full mr-3 ring-2 ring-white"
											style="background-color: {category.color}"
										></span>
									{/if}
									{category.name}
								</button>
							{/each}
						</div>
						{/if}
					</div>
				{/if}

				<div class="pt-6 border-t border-slate-200 mt-6 space-y-1">
					<button
						onclick={() => {
							selectedCategoryId.set(null);
							showArchived.set(true);
							showTrashed.set(false);
						}}
						class="w-full text-left px-4 py-2 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-all flex items-center gap-3"
						class:bg-primary-bg={$showArchived}
						class:text-primary={$showArchived}
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
						</svg>
						Archived
					</button>
					<button
						onclick={() => {
							selectedCategoryId.set(null);
							showArchived.set(false);
							showTrashed.set(true);
						}}
						class="w-full text-left px-4 py-2 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-all flex items-center gap-3"
						class:bg-primary-bg={$showTrashed}
						class:text-primary={$showTrashed}
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
						Trash
					</button>
				</div>
			</div>
		</nav>

		<!-- Footer -->
		<div class="p-2 md:p-4 border-t border-slate-200 bg-slate-50 space-y-3">
			{#if $isOffline}
				<div class="px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-[10px] md:text-xs font-semibold">
					<div class="flex items-center gap-2">
						<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd" />
						</svg>
						Offline mode
						{#if $syncQueue.length > 0}
							<span class="ml-auto font-bold">({$syncQueue.length})</span>
						{/if}
					</div>
				</div>
			{/if}
			
			<!-- Color Picker -->
			<div class="flex items-center justify-center gap-3 px-3 py-2">
				<button
					onclick={() => changeTheme('teal')}
					class="group relative"
					aria-label="Teal theme"
				>
					<div 
						class="w-7 h-7 rounded-xl bg-teal-400 border-2 transition-all cursor-pointer"
						class:border-slate-300={currentTheme !== 'teal'}
						class:border-teal-600={currentTheme === 'teal'}
						class:ring-2={currentTheme === 'teal'}
						class:ring-teal-200={currentTheme === 'teal'}
						class:ring-offset-2={currentTheme === 'teal'}
					>
						{#if currentTheme === 'teal'}
							<svg class="w-full h-full text-white p-1" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
						{/if}
					</div>
				</button>
				<button
					onclick={() => changeTheme('orange')}
					class="group relative"
					aria-label="Orange theme"
				>
					<div 
						class="w-7 h-7 rounded-xl bg-orange-400 border-2 transition-all cursor-pointer"
						class:border-slate-300={currentTheme !== 'orange'}
						class:border-orange-600={currentTheme === 'orange'}
						class:ring-2={currentTheme === 'orange'}
						class:ring-orange-200={currentTheme === 'orange'}
						class:ring-offset-2={currentTheme === 'orange'}
					>
						{#if currentTheme === 'orange'}
							<svg class="w-full h-full text-white p-1" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
						{/if}
					</div>
				</button>
				<button
					onclick={() => changeTheme('pink')}
					class="group relative"
					aria-label="Pink theme"
				>
					<div 
						class="w-7 h-7 rounded-xl bg-pink-400 border-2 transition-all cursor-pointer"
						class:border-slate-300={currentTheme !== 'pink'}
						class:border-pink-600={currentTheme === 'pink'}
						class:ring-2={currentTheme === 'pink'}
						class:ring-pink-200={currentTheme === 'pink'}
						class:ring-offset-2={currentTheme === 'pink'}
					>
						{#if currentTheme === 'pink'}
							<svg class="w-full h-full text-white p-1" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
						{/if}
					</div>
				</button>
				<button
					onclick={() => changeTheme('lime')}
					class="group relative"
					aria-label="Lime theme"
				>
					<div 
						class="w-7 h-7 rounded-xl bg-lime-500 border-2 transition-all cursor-pointer"
						class:border-slate-300={currentTheme !== 'lime'}
						class:border-lime-700={currentTheme === 'lime'}
						class:ring-2={currentTheme === 'lime'}
						class:ring-lime-200={currentTheme === 'lime'}
						class:ring-offset-2={currentTheme === 'lime'}
					>
						{#if currentTheme === 'lime'}
							<svg class="w-full h-full text-white p-1" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
						{/if}
					</div>
				</button>
			</div>
			
			<div class="flex items-center justify-between px-1 md:px-2">
				<span class="text-xs md:text-sm font-medium text-slate-700 truncate flex-1">{data?.user?.email}</span>
				<button
					onclick={handleLogout}
					class="text-xs md:text-sm text-red-600 hover:text-red-700 font-semibold transition-colors"
				>
					Logout
				</button>
			</div>
			
			<!-- Plan Info -->
			<div class="pt-3 border-t border-slate-200">
				{#if data?.user?.plan === 'free' && $currentWorkspace}
					<div class="space-y-2">
					<div class="grid grid-cols-2 gap-2 text-xs">
						<div class="text-slate-600">
							<span class="font-medium">Workspaces:</span>
							<span class="font-bold text-slate-900 ml-1">{$workspaces.length}/1</span>
						</div>
						<div class="text-slate-600">
							<span class="font-medium">Notes:</span>
							<span class="font-bold ml-1" class:text-slate-900={$notes.filter(n => !n.isTrashed).length < 80} class:text-amber-700={$notes.filter(n => !n.isTrashed).length >= 80} class:text-red-600={$notes.filter(n => !n.isTrashed).length >= 100}>
								{$notes.filter(n => !n.isTrashed).length}/100
							</span>
						</div>
					</div>
					<a
						href="/pricing"
						class="w-full block text-center px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-lg transition-all"
					>
						<svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
						Upgrade to Pro
					</a>
				</div>
			{:else}
				<a
					href="/pricing"
					class="w-full block text-center px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-lg transition-all"
				>
					<svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
					Upgrade to Pro
				</a>
			{/if}
			</div>
		</div>
	</aside>
	{/if}

	<!-- Menu Button -->
	{#if !$sidebarOpen}
		<button
			onclick={() => sidebarOpen.set(true)}
			class="fixed bottom-4 left-4 z-50 bg-primary text-white p-3 rounded-lg hover:bg-primary-hover transition-all"
			aria-label="Open sidebar"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
				<line x1="9" x2="9" y1="3" y2="21"/>
			</svg>
		</button>
	{/if}

	<!-- Main Content -->
	<main class="flex-1 flex flex-col overflow-hidden">
		{@render children()}
	</main>
</div>

<!-- Workspace Modal -->
{#if showWorkspaceModal}
	<div 
		transition:fade={{ duration: 200 }} 
		class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
		onclick={() => showWorkspaceModal = false}
		onkeydown={(e) => e.key === 'Escape' && (showWorkspaceModal = false)}
		role="dialog"
		aria-modal="true"
		aria-labelledby="workspace-modal-title"
	>
		<div 
			transition:slide={{ duration: 300 }} 
			class="bg-white rounded-xl max-w-md w-full p-4 md:p-6 transform transition-all" 
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="document"
		>
			<h2 id="workspace-modal-title" class="text-xl font-bold text-slate-900 mb-4">Create New Workspace</h2>
			<form onsubmit={(e) => { e.preventDefault(); createWorkspace(); }}>
				{#if workspaceError}
					<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
						{workspaceError}
					</div>
				{/if}
				<div class="mb-4">
					<label for="workspace-name" class="block text-xs md:text-sm font-semibold text-slate-700 mb-1.5">
						Workspace Name
					</label>
					<input
						id="workspace-name"
						type="text"
						bind:value={newWorkspaceName}
						placeholder="My Workspace"
						class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium"
					/>
				</div>
				<div class="flex gap-2">
					<button
						type="button"
						onclick={() => showWorkspaceModal = false}
						class="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-all"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={!newWorkspaceName.trim() || isCreatingWorkspace}
						class="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					>
						{isCreatingWorkspace ? 'Creating...' : 'Create'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Rename Workspace Modal -->
{#if showRenameModal}
	<div 
		transition:fade={{ duration: 200 }} 
		class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
		onclick={() => showRenameModal = false}
		onkeydown={(e) => e.key === 'Escape' && (showRenameModal = false)}
		role="dialog"
		aria-modal="true"
		aria-labelledby="rename-modal-title"
	>
		<div 
			transition:slide={{ duration: 300 }} 
			class="bg-white rounded-xl max-w-md w-full p-4 md:p-6 transform transition-all" 
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="document"
		>
			<h2 id="rename-modal-title" class="text-xl font-bold text-slate-900 mb-4">Rename Workspace</h2>
			<form onsubmit={(e) => { e.preventDefault(); renameWorkspace(); }}>
				<div class="mb-4">
					<label for="rename-workspace-name" class="block text-xs md:text-sm font-semibold text-slate-700 mb-1.5">
						Workspace Name
					</label>
					<input
						id="rename-workspace-name"
						type="text"
						bind:value={renameWorkspaceName}
						placeholder="My Workspace"
						class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium"
					/>
				</div>
				<div class="flex gap-2">
					<button
						type="button"
						onclick={() => showRenameModal = false}
						class="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-all"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={!renameWorkspaceName.trim() || isRenamingWorkspace}
						class="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					>
						{isRenamingWorkspace ? 'Renaming...' : 'Rename'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Delete Workspace Confirmation Modal -->
{#if showDeleteModal}
	<div 
		transition:fade={{ duration: 200 }} 
		class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
		onclick={() => showDeleteModal = false}
		onkeydown={(e) => e.key === 'Escape' && (showDeleteModal = false)}
		role="dialog"
		aria-modal="true"
		aria-labelledby="delete-modal-title"
	>
		<div 
			transition:slide={{ duration: 300 }} 
			class="bg-white rounded-xl max-w-md w-full p-6 transform transition-all" 
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="document"
		>
			<h2 id="delete-modal-title" class="text-xl font-bold text-slate-900 mb-4">Delete Workspace</h2>
			<p class="text-sm text-slate-600 leading-relaxed mb-4">
				This will permanently delete <strong>"{$currentWorkspace?.name}"</strong> and all its notes and categories. This action cannot be undone.
			</p>
			<form onsubmit={(e) => { e.preventDefault(); confirmDeleteWorkspace(); }}>
				<div class="mb-4">
					<label for="delete-workspace-name" class="block text-sm font-semibold text-slate-700 mb-2">
						Type <span class="font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{$currentWorkspace?.name}</span> to confirm:
					</label>
					<input
						id="delete-workspace-name"
						type="text"
						bind:value={deleteWorkspaceName}
						placeholder="Enter workspace name"
						class="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium"
					/>
				</div>
				<div class="flex gap-3">
					<button
						type="button"
						onclick={() => { showDeleteModal = false; deleteWorkspaceName = ''; }}
						class="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-all"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={isDeletingWorkspace || deleteWorkspaceName !== $currentWorkspace?.name}
						class="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					>
						{isDeletingWorkspace ? 'Deleting...' : 'Delete Workspace'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Upgrade Prompt Modal -->
{#if showUpgradePrompt}
	<div 
		transition:fade={{ duration: 200 }} 
		class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
		onclick={() => { showUpgradePrompt = false; showWorkspaceModal = false; newWorkspaceName = ''; workspaceError = ''; }}
		onkeydown={(e) => e.key === 'Escape' && (showUpgradePrompt = false, showWorkspaceModal = false)}
		role="dialog"
		aria-modal="true"
		aria-labelledby="upgrade-modal-title"
	>
		<div 
			transition:slide={{ duration: 300 }} 
			class="bg-white rounded-xl max-w-lg w-full p-6 md:p-8 transform transition-all" 
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="document"
		>
			<div class="text-center mb-6">
				<div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				<h2 id="upgrade-modal-title" class="text-2xl font-bold text-slate-900 mb-2">Upgrade to Pro</h2>
				<p class="text-slate-600">You've reached the workspace limit for the free plan</p>
			</div>

			<div class="bg-slate-50 rounded-lg p-4 mb-6">
				<div class="flex items-start gap-3 mb-3">
					<svg class="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
					</svg>
					<div>
						<h3 class="font-semibold text-slate-900 text-sm">Unlimited Workspaces</h3>
						<p class="text-xs text-slate-600">Create as many workspaces as you need</p>
					</div>
				</div>
				<div class="flex items-start gap-3 mb-3">
					<svg class="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
					</svg>
					<div>
						<h3 class="font-semibold text-slate-900 text-sm">Unlimited Notes</h3>
						<p class="text-xs text-slate-600">No limits on how many notes you can create</p>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<svg class="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
					</svg>
					<div>
						<h3 class="font-semibold text-slate-900 text-sm">Advanced Features</h3>
						<p class="text-xs text-slate-600">Offline sync, version history, priority support & more</p>
					</div>
				</div>
			</div>

			<div class="text-center mb-6">
				<div class="text-3xl font-bold text-slate-900 mb-1">
					$9<span class="text-lg font-normal text-slate-600">/month</span>
				</div>
				<p class="text-sm text-slate-500">14-day free trial • Cancel anytime</p>
			</div>

			<div class="flex flex-col sm:flex-row gap-3">
				<button
					type="button"
					onclick={() => { showUpgradePrompt = false; showWorkspaceModal = false; newWorkspaceName = ''; workspaceError = ''; }}
					class="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-all order-2 sm:order-1"
				>
					Maybe Later
				</button>
				<button
					type="button"
					onclick={() => goto('/pricing')}
					class="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg order-1 sm:order-2"
				>
					Upgrade to Pro
				</button>
			</div>
		</div>
	</div>
{/if}
