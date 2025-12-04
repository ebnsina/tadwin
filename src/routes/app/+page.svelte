<script lang="ts">
	import { slide, fade } from 'svelte/transition';
	import { currentWorkspace, filteredNotes, selectedNote, searchQuery, isOffline, isSaving, lastSaved, notes } from '$lib/stores';
	import { addToSyncQueue, saveNotesLocally } from '$lib/sync';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
	import type { Note } from '$lib/types';

	let noteTitle = $state('');
	let noteContent = $state('');
	let saveTimeout: NodeJS.Timeout;
	let isCreatingNote = $state(false);
	let showConflictModal = $state(false);
	let conflictServerNote: Note | null = $state(null);
	let hasUnsavedChanges = $state(false);
	let noteError = $state('');
	let showNoteUpgradePrompt = $state(false);

	// Update editor when selected note changes
	$effect(() => {
		if ($selectedNote) {
			noteTitle = $selectedNote.title;
			noteContent = $selectedNote.content;
			hasUnsavedChanges = false;
		} else {
			noteTitle = '';
			noteContent = '';
			hasUnsavedChanges = false;
		}
	});

	async function createNote() {
		if (!$currentWorkspace || isCreatingNote) return;

		isCreatingNote = true;
		noteError = '';

		try {
			if ($isOffline) {
				// Create note locally when offline
				const localNote: Note = {
					id: crypto.randomUUID(),
					title: 'Untitled',
					content: '',
					workspaceId: $currentWorkspace.id,
					categoryId: null,
					isPinned: false,
					isArchived: false,
					isTrashed: false,
					lastModified: new Date(),
					clientRev: 0,
					createdAt: new Date(),
					updatedAt: new Date()
				};

				// Add to sync queue
				addToSyncQueue({
					action: 'create',
					type: 'note',
					data: localNote
				});

				selectedNote.set(localNote);
			} else {
				const response = await fetch(`/api/workspaces/${$currentWorkspace.id}/notes`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ title: 'Untitled', content: '' })
				});

				if (response.ok) {
					const data = await response.json();
					selectedNote.set(data.note);
					// Reload notes list
					await loadNotes();
				} else {
					const data = await response.json();
					if (data.code === 'NOTE_LIMIT_REACHED') {
						showNoteUpgradePrompt = true;
						noteError = data.message || 'Note limit reached';
					} else {
						noteError = data.message || 'Failed to create note';
					}
				}
			}
		} catch (error) {
			noteError = 'Failed to create note';
		} finally {
			isCreatingNote = false;
		}
	}

	async function loadNotes() {
		if (!$currentWorkspace) return;

		const response = await fetch(`/api/workspaces/${$currentWorkspace.id}/notes`);
		if (response.ok) {
			const data = await response.json();
			// Update notes store
			notes.set(data.notes);
		}
	}

	function handleContentChange(content: string) {
		noteContent = content;
		hasUnsavedChanges = true;
		debouncedSave();
	}

	function handleTitleChange() {
		hasUnsavedChanges = true;
		debouncedSave();
	}

	function debouncedSave() {
		if (!$selectedNote) return;

		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			saveNote();
		}, 2000); // Auto-save after 2 seconds of inactivity
	}

	async function saveNote(manual = false) {
		if (!$selectedNote || !$currentWorkspace) return;

		isSaving.set(true);
		hasUnsavedChanges = false;

		const updatedNote = {
			...$selectedNote,
			title: noteTitle || 'Untitled',
			content: noteContent,
			lastModified: new Date()
		};

		if ($isOffline) {
			// Save locally and add to sync queue
			addToSyncQueue({
				action: 'update',
				type: 'note',
				data: updatedNote
			});
			isSaving.set(false);
			lastSaved.set(new Date());
		} else {
			try {
				const response = await fetch(
					`/api/workspaces/${$currentWorkspace.id}/notes/${$selectedNote.id}`,
					{
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							title: noteTitle || 'Untitled',
							content: noteContent,
							clientRev: $selectedNote.clientRev
						})
					}
				);

				if (response.ok) {
					const data = await response.json();
					selectedNote.set(data.note);
					lastSaved.set(new Date());
					await loadNotes();
				} else if (response.status === 409) {
					// Conflict detected - show modal instead of alert
					const data = await response.json();
					conflictServerNote = data.note;
					showConflictModal = true;
				}
			} catch (error) {
				console.error('Save error:', error);
			} finally {
				isSaving.set(false);
			}
		}
	}

	function handleManualSave() {
		clearTimeout(saveTimeout);
		saveNote(true);
	}

	function acceptServerVersion() {
		if (conflictServerNote) {
			selectedNote.set(conflictServerNote);
			showConflictModal = false;
			conflictServerNote = null;
		}
	}

	function keepLocalVersion() {
		showConflictModal = false;
		conflictServerNote = null;
		// Force save with current content
		saveNote(true);
	}

	async function togglePin() {
		if (!$selectedNote || !$currentWorkspace) return;

		const response = await fetch(
			`/api/workspaces/${$currentWorkspace.id}/notes/${$selectedNote.id}`,
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					isPinned: !$selectedNote.isPinned,
					clientRev: $selectedNote.clientRev
				})
			}
		);

		if (response.ok) {
			const data = await response.json();
			selectedNote.set(data.note);
			await loadNotes();
		}
	}

	async function toggleArchive() {
		if (!$selectedNote || !$currentWorkspace) return;

		const response = await fetch(
			`/api/workspaces/${$currentWorkspace.id}/notes/${$selectedNote.id}`,
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					isArchived: !$selectedNote.isArchived,
					clientRev: $selectedNote.clientRev
				})
			}
		);

		if (response.ok) {
			const data = await response.json();
			selectedNote.set(data.note);
			await loadNotes();
		}
	}

	async function moveToTrash() {
		if (!$selectedNote || !$currentWorkspace) return;

		const response = await fetch(
			`/api/workspaces/${$currentWorkspace.id}/notes/${$selectedNote.id}`,
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					isTrashed: true,
					clientRev: $selectedNote.clientRev
				})
			}
		);

		if (response.ok) {
			selectedNote.set(null);
			await loadNotes();
		}
	}

	async function deleteNote() {
		if (!$selectedNote || !$currentWorkspace) return;
		if (!confirm('Permanently delete this note?')) return;

		const response = await fetch(
			`/api/workspaces/${$currentWorkspace.id}/notes/${$selectedNote.id}`,
			{
				method: 'DELETE'
			}
		);

		if (response.ok) {
			selectedNote.set(null);
			await loadNotes();
		}
	}

	function selectNote(note: Note) {
		selectedNote.set(note);
	}

	function formatTimeAgo(date: Date) {
		const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
		if (seconds < 10) return 'just now';
		if (seconds < 60) return `${seconds}s ago`;
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		return new Date(date).toLocaleDateString();
	}
</script>

<div class="flex h-full">
	<!-- Notes List -->
	<div 
		class="w-full md:w-80 border-r border-slate-200 bg-white flex flex-col"
		class:hidden={$selectedNote !== null}
		class:md:flex={true}
	>
		<!-- Search Bar -->
		<div class="p-3 md:p-5 border-b border-slate-200 bg-slate-50">
			<div class="relative">
				<svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<input
					type="text"
					bind:value={$searchQuery}
					placeholder="Search notes..."
					class="w-full pl-10 pr-3 py-2 md:pl-12 md:pr-4 md:py-2 border-2 border-slate-200 rounded-lg md:rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium"
				/>
			</div>
		</div>

		<!-- New Note Button -->
		<div class="p-3 md:p-5 border-b border-slate-200">
			<button
				onclick={createNote}
				disabled={isCreatingNote}
				class="w-full px-3 py-1.5 md:px-4 md:py-2 bg-primary hover:bg-primary-hover text-white text-xs md:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 md:gap-2 disabled:opacity-50"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				New Note
			</button>
			{#if noteError && !showNoteUpgradePrompt}
				<div transition:slide={{ duration: 200 }} class="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
					<p class="text-xs text-red-600 font-medium">{noteError}</p>
				</div>
			{/if}
		</div>

		<!-- Notes List -->
		<div class="flex-1 overflow-y-auto">
			{#if $filteredNotes.length === 0}
				<div class="p-8 text-center text-slate-500">
					<svg class="w-16 h-16 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					<p class="text-sm font-medium">
						{$searchQuery ? 'No notes found' : 'No notes yet'}
					</p>
				</div>
			{:else}
				{#each $filteredNotes as note (note.id)}
					<button
						transition:slide={{ duration: 200 }}
						onclick={() => selectNote(note)}
						class="w-full text-left px-3 py-2.5 md:px-5 md:py-4 border-b border-slate-100 hover:bg-primary-bg transition-all group"
						class:bg-primary-bg={$selectedNote?.id === note.id}
						class:border-l-4={$selectedNote?.id === note.id}
						class:border-l-primary={$selectedNote?.id === note.id}
					>
						<div class="flex items-start justify-between">
							<div class="flex-1 min-w-0">
								<h3 class="font-bold text-slate-900 truncate flex items-center gap-1.5 md:gap-2 text-sm md:text-base">
									{#if note.isPinned}
										<svg class="w-3.5 md:w-4 h-3.5 md:h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
											<path d="M10 2a.75.75 0 01.75.75v8.5a.75.75 0 01-1.5 0v-8.5A.75.75 0 0110 2z M9.25 14.5a.75.75 0 00.75.75h.01a.75.75 0 00.75-.75v-.01a.75.75 0 00-.75-.75H10a.75.75 0 00-.75.75v.01z" />
										</svg>
									{/if}
									{note.title}
								</h3>
								<p class="text-xs md:text-sm text-slate-600 truncate mt-1 md:mt-1.5 leading-relaxed">
									{note.content.slice(0, 100)}
								</p>
								<p class="text-[10px] md:text-xs text-slate-400 mt-1.5 md:mt-2 font-medium">
									{formatTimeAgo(note.lastModified)}
								</p>
							</div>
							{#if note.category}
								<span
									class="ml-3 w-3 h-3 rounded-full shrink-0 ring-2 ring-white"
									style="background-color: {note.category.color || '#gray'}"
								></span>
							{/if}
						</div>
					</button>
				{/each}
			{/if}
		</div>
	</div>

	<!-- Editor -->
	<div 
		class="flex-1 flex flex-col bg-white"
		class:hidden={$selectedNote === null}
		class:md:flex={$selectedNote !== null}
	>
		{#if $selectedNote}
			<!-- Mobile Back Button -->
			<div transition:fade={{ duration: 200 }} class="md:hidden px-3 py-2 border-b border-slate-200 bg-slate-50">
				<button
					onclick={() => selectedNote.set(null)}
					class="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-semibold"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
					Back to Notes
				</button>
			</div>

			<!-- Note Header -->
			<div class="px-4 py-4 border-b border-slate-200 bg-slate-50/50">
				<input
					type="text"
					bind:value={noteTitle}
					oninput={handleTitleChange}
					placeholder="Note title"
					class="w-full text-2xl font-extrabold text-slate-900 border-none outline-none focus:ring-0 px-0 bg-transparent placeholder:text-slate-300"
				/>
				<div class="flex items-center gap-2 mt-3 flex-wrap">
					<div class="flex items-center gap-1.5 flex-wrap">
						<button
							onclick={togglePin}
								class="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg hover:bg-white transition-all border border-slate-200"
								class:text-primary={$selectedNote.isPinned}
							class:bg-primary-bg={$selectedNote.isPinned}
							class:border-primary-light={$selectedNote.isPinned}
						>
							{$selectedNote.isPinned ? '📌 Pinned' : 'Pin'}
						</button>
						<button
							onclick={toggleArchive}
								class="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg hover:bg-white transition-all border border-slate-200"
						>
							{$selectedNote.isArchived ? 'Unarchive' : 'Archive'}
						</button>
						<button 
							onclick={moveToTrash} 
								class="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg hover:bg-red-50 hover:text-red-600 transition-all border border-slate-200"
						>
							Trash
						</button>
						{#if $selectedNote.isTrashed}
							<button 
								onclick={deleteNote} 
									class="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all"
							>
								Delete Forever
							</button>
						{/if}
					</div>
					<div class="ml-auto flex items-center gap-2 md:gap-3">
						<!-- Save Status -->
						<div class="text-xs md:text-sm text-slate-500 font-medium hidden sm:block">
							{#if $isSaving}
								<span class="flex items-center gap-2">
									<svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Saving...
								</span>
							{:else if hasUnsavedChanges}
								<span class="text-amber-600 font-semibold">Unsaved changes</span>
							{:else if $lastSaved}
								<span>Saved {formatTimeAgo($lastSaved)}</span>
							{/if}
						</div>
						<!-- Manual Save Button -->
						<button
							onclick={handleManualSave}
							disabled={$isSaving || !hasUnsavedChanges}
								class="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs md:text-sm font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
						>
							<span class="hidden sm:inline">Save Now</span>
							<span class="sm:hidden">Save</span>
						</button>
					</div>
				</div>
			</div>

			<!-- Editor -->
			<div class="flex-1 overflow-hidden">
				<MarkdownEditor bind:value={noteContent} onchange={handleContentChange} />
			</div>
		{:else}
			<div class="flex items-center justify-center h-full bg-slate-50">
				<div class="text-center">
					<svg
						class="w-24 h-24 mx-auto mb-6 text-slate-300"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					<p class="text-xl font-bold text-slate-700 mb-2">Select a note or create a new one</p>
					<p class="text-sm text-slate-500">Start writing your thoughts</p>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Conflict Resolution Modal -->
{#if showConflictModal && conflictServerNote}
	<div transition:fade={{ duration: 200 }} class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
		<div transition:slide={{ duration: 300 }} class="bg-white rounded-xl max-w-2xl w-full p-4 md:p-6">
			<div class="flex items-start gap-2 mb-4">
				<div class="p-2 md:p-3 bg-amber-100 rounded-lg md:rounded-xl">
					<svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
				</div>
				<div class="flex-1">
					<h2 class="text-lg font-extrabold text-slate-900 mb-1.5">Sync Conflict Detected</h2>
					<p class="text-xs md:text-base text-slate-600 leading-relaxed">
						This note was modified elsewhere. Choose which version to keep:
					</p>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
				<!-- Local Version -->
				<div class="border-2 border-primary-light bg-primary-bg rounded-lg p-3">
					<h3 class="text-sm md:text-base font-bold text-slate-900 mb-1.5 md:mb-2 flex items-center gap-1.5 md:gap-2">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
						Your Local Version
					</h3>
					<div class="bg-white rounded-lg p-4 max-h-40 overflow-y-auto">
						<p class="text-xs md:text-sm font-bold text-slate-900 mb-1.5 md:mb-2">{noteTitle}</p>
						<p class="text-xs md:text-sm text-slate-600 whitespace-pre-wrap">{noteContent.slice(0, 200)}{noteContent.length > 200 ? '...' : ''}</p>
					</div>
				</div>

				<!-- Server Version -->
				<div class="border-2 border-blue-200 bg-blue-50 rounded-lg p-3">
					<h3 class="text-sm md:text-base font-bold text-blue-900 mb-1.5 md:mb-2 flex items-center gap-1.5 md:gap-2">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
						</svg>
						Server Version
					</h3>
					<div class="bg-white rounded-lg p-4 max-h-40 overflow-y-auto">
						<p class="text-xs md:text-sm font-bold text-slate-900 mb-1.5 md:mb-2">{conflictServerNote.title}</p>
						<p class="text-xs md:text-sm text-slate-600 whitespace-pre-wrap">{conflictServerNote.content.slice(0, 200)}{conflictServerNote.content.length > 200 ? '...' : ''}</p>
					</div>
				</div>
			</div>

			<div class="flex gap-2">
				<button
					onclick={acceptServerVersion}
					class="flex-1 px-4 py-2.5 bg-blue-400 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-all transform hover:-translate-y-0.5"
				>
					Use Server Version
				</button>
				<button
					onclick={keepLocalVersion}
					class="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-lg transition-all transform hover:-translate-y-0.5"
				>
					Keep My Version
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Note Limit Upgrade Prompt -->
{#if showNoteUpgradePrompt}
	<div transition:fade={{ duration: 200 }} class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
		<div transition:slide={{ duration: 300 }} class="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8">
			<div class="text-center mb-6">
				<div class="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
					<svg class="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
					</svg>
				</div>
				<h2 class="text-2xl font-extrabold text-slate-900 mb-3">Note Limit Reached</h2>
				<p class="text-slate-600 leading-relaxed mb-2">
					You've reached the 100 note limit on the Free plan.
				</p>
				<p class="text-slate-600 leading-relaxed">
					Upgrade to <span class="font-bold text-primary">Pro</span> for unlimited notes and more features!
				</p>
			</div>

			<!-- Pro Plan Features -->
			<div class="bg-linear-to-br from-primary-bg to-blue-50 rounded-xl p-4 mb-6 border border-primary-light">
				<div class="flex items-center gap-2 mb-3">
					<div class="text-2xl font-extrabold text-slate-900">$9</div>
					<div class="text-sm text-slate-600 font-semibold">/month</div>
					<div class="ml-auto px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">POPULAR</div>
				</div>
				<ul class="space-y-2">
					<li class="flex items-center gap-2 text-sm text-slate-700 font-medium">
						<svg class="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						Unlimited workspaces
					</li>
					<li class="flex items-center gap-2 text-sm text-slate-700 font-medium">
						<svg class="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="font-bold">Unlimited notes</span>
					</li>
					<li class="flex items-center gap-2 text-sm text-slate-700 font-medium">
						<svg class="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						Advanced search
					</li>
					<li class="flex items-center gap-2 text-sm text-slate-700 font-medium">
						<svg class="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						Offline sync
					</li>
					<li class="flex items-center gap-2 text-sm text-slate-700 font-medium">
						<svg class="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						Priority support
					</li>
				</ul>
			</div>

			<div class="flex gap-3">
				<button
					onclick={() => { showNoteUpgradePrompt = false; noteError = ''; }}
					class="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all"
				>
					Maybe Later
				</button>
				<a
					href="/pricing"
					class="flex-1 px-4 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all text-center"
				>
					Upgrade to Pro
				</a>
			</div>

			{#if noteError}
				<p class="mt-3 text-xs text-center text-slate-500">{noteError}</p>
			{/if}
		</div>
	</div>
{/if}
