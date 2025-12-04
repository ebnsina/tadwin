<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';
	import { EditorState } from '@codemirror/state';
	import { markdown } from '@codemirror/lang-markdown';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';

	let {
		value = $bindable(''),
		onchange = (value: string) => {}
	}: {
		value?: string;
		onchange?: (value: string) => void;
	} = $props();

	let editorContainer: HTMLDivElement;
	let previewContainer: HTMLDivElement;
	let view: EditorView;
	let showPreview = $state(false);

	onMount(() => {
		const startState = EditorState.create({
			doc: value,
			extensions: [
				basicSetup,
				markdown(),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						const newValue = update.state.doc.toString();
						value = newValue;
						onchange(newValue);
						updatePreview(newValue);
					}
				})
			]
		});

		view = new EditorView({
			state: startState,
			parent: editorContainer
		});

		updatePreview(value);

		return () => {
			view.destroy();
		};
	});

	function updatePreview(content: string) {
		if (previewContainer) {
			const html = marked(content);
			previewContainer.innerHTML = DOMPurify.sanitize(html as string);
		}
	}

	function insertMarkdown(prefix: string, suffix: string = '') {
		const selection = view.state.selection.main;
		const selectedText = view.state.doc.sliceString(selection.from, selection.to);

		view.dispatch({
			changes: {
				from: selection.from,
				to: selection.to,
				insert: prefix + selectedText + suffix
			},
			selection: {
				anchor: selection.from + prefix.length,
				head: selection.to + prefix.length
			}
		});

		view.focus();
	}

	// Update editor when value changes externally
	$effect(() => {
		if (view && value !== view.state.doc.toString()) {
			view.dispatch({
				changes: {
					from: 0,
					to: view.state.doc.length,
					insert: value
				}
			});
			updatePreview(value);
		}
	});
</script>

<div class="flex flex-col h-full">
	<!-- Toolbar -->
	<div class="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
		<div class="flex items-center space-x-2">
			<button
				onclick={() => insertMarkdown('**', '**')}
				class="p-2 hover:bg-gray-100 rounded-lg"
				title="Bold"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"
					/>
				</svg>
			</button>

			<button
				onclick={() => insertMarkdown('*', '*')}
				class="p-2 hover:bg-gray-100 rounded-lg"
				title="Italic"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 20l4-16m-4 4h8M6 16h8"
					/>
				</svg>
			</button>

			<button
				onclick={() => insertMarkdown('# ', '')}
				class="p-2 hover:bg-gray-100 rounded-lg"
				title="Heading"
			>
				<span class="text-sm font-bold">H</span>
			</button>

			<button
				onclick={() => insertMarkdown('[', '](url)')}
				class="p-2 hover:bg-gray-100 rounded-lg"
				title="Link"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
					/>
				</svg>
			</button>

			<button
				onclick={() => insertMarkdown('- ', '')}
				class="p-2 hover:bg-gray-100 rounded-lg"
				title="List"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>

			<button
				onclick={() => insertMarkdown('```\n', '\n```')}
				class="p-2 hover:bg-gray-100 rounded-lg"
				title="Code Block"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
					/>
				</svg>
			</button>
		</div>

		<button
			onclick={() => (showPreview = !showPreview)}
			class="px-3 py-1 text-sm font-medium rounded-lg hover:bg-primary-bg transition-colors"
			class:bg-primary-bg={showPreview}
			class:text-primary={showPreview}
		>
			{showPreview ? 'Edit' : 'Preview'}
		</button>
	</div>

	<!-- Editor/Preview -->
	<div class="flex-1 overflow-hidden relative">
		<div
			bind:this={previewContainer}
			class="h-full overflow-y-auto px-4 py-3 prose prose-sm max-w-none absolute inset-0 bg-white"
			class:hidden={!showPreview}
		></div>
		<div 
			bind:this={editorContainer} 
			class="h-full overflow-y-auto absolute inset-0"
			class:hidden={showPreview}
		></div>
	</div>
</div>

<style>
	:global(.cm-editor) {
		height: 100%;
	}

	:global(.cm-scroller) {
		overflow: auto;
		font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
		font-size: 14px;
		line-height: 1.6;
	}

	:global(.prose) {
		max-width: 65ch;
	}

	:global(.prose h1) {
		font-size: 2em;
		font-weight: bold;
		margin-top: 0.5em;
		margin-bottom: 0.5em;
	}

	:global(.prose h2) {
		font-size: 1.5em;
		font-weight: bold;
		margin-top: 0.5em;
		margin-bottom: 0.5em;
	}

	:global(.prose p) {
		margin-bottom: 1em;
	}

	:global(.prose code) {
		background-color: #f3f4f6;
		padding: 0.2em 0.4em;
		border-radius: 3px;
		font-size: 0.9em;
	}

	:global(.prose pre) {
		background-color: #1f2937;
		color: #f3f4f6;
		padding: 1em;
		border-radius: 0.5em;
		overflow-x: auto;
	}

	:global(.prose pre code) {
		background-color: transparent;
		padding: 0;
		color: inherit;
	}

	:global(.prose ul),
	:global(.prose ol) {
		padding-left: 2em;
		margin-bottom: 1em;
	}

	:global(.prose a) {
		color: #3b82f6;
		text-decoration: underline;
	}
</style>
