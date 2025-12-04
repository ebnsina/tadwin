<script lang="ts">
	import { onMount } from 'svelte';

	let { children, text, color = 'var(--primary-color)' } = $props<{
		children: any;
		text: string;
		color?: string;
	}>();

	let tooltipWrapper: HTMLDivElement;
	let tooltipElement: HTMLDivElement;
	let showTooltip = $state(false);
	let position = $state({ left: 0, top: 0, adjustLeft: false });

	function updatePosition() {
		if (!tooltipWrapper || !tooltipElement) return;

		const wrapperRect = tooltipWrapper.getBoundingClientRect();
		const tooltipRect = tooltipElement.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		// Calculate tooltip position above the element
		let left = 0;
		let top = -tooltipRect.height - 10;
		let adjustLeft = false;

		// Check if tooltip would overflow on the right
		if (wrapperRect.left + tooltipRect.width > viewportWidth - 10) {
			// Align tooltip to the right edge instead
			left = wrapperRect.width - tooltipRect.width;
			adjustLeft = true;
		}

		// Check if tooltip would overflow on the left
		if (wrapperRect.left + left < 10) {
			left = -wrapperRect.left + 10;
			adjustLeft = true;
		}

		// Check if tooltip would overflow on top
		if (wrapperRect.top + top < 10) {
			// Position below instead
			top = wrapperRect.height + 10;
		}

		position = { left, top, adjustLeft };
	}

	function handleMouseEnter() {
		showTooltip = true;
		setTimeout(updatePosition, 0);
	}

	function handleMouseLeave() {
		showTooltip = false;
	}

	onMount(() => {
		window.addEventListener('resize', updatePosition);
		return () => {
			window.removeEventListener('resize', updatePosition);
		};
	});
</script>

<div
	bind:this={tooltipWrapper}
	class="tooltip-wrapper-js"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	role="tooltip"
>
	{@render children()}
	
	{#if showTooltip}
		<div
			bind:this={tooltipElement}
			class="tooltip-text-js"
			style="left: {position.left}px; top: {position.top}px; --tooltip-color: {color};"
			class:adjust-left={position.adjustLeft}
		>
			{text}
		</div>
	{/if}
</div>

<style>
	.tooltip-wrapper-js {
		position: relative;
		display: inline-block;
	}

	.tooltip-text-js {
		position: absolute;
		z-index: 1000;
		background-color: var(--tooltip-color);
		color: white;
		text-align: left;
		padding: 0.625rem 0.875rem;
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		line-height: 1.4;
		font-family: var(--font-family);
		white-space: normal;
		max-width: 16rem;
		width: max-content;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		animation: tooltipFadeIn 0.2s ease-out;
		pointer-events: none;
	}

	.tooltip-text-js::after {
		content: "";
		position: absolute;
		border-width: 5px;
		border-style: solid;
	}

	/* Arrow pointing down (tooltip above element) */
	.tooltip-text-js::after {
		top: 100%;
		left: 1.25rem;
		border-color: var(--tooltip-color) transparent transparent transparent;
	}

	/* Arrow pointing up (tooltip below element) */
	.tooltip-text-js[style*="top: "]::after {
		bottom: 100%;
		top: auto;
		border-color: transparent transparent var(--tooltip-color) transparent;
	}

	.tooltip-text-js.adjust-left::after {
		left: auto;
		right: 1.25rem;
	}

	@keyframes tooltipFadeIn {
		from {
			opacity: 0;
			transform: translateY(5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
