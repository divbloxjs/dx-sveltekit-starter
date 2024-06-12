<script>
	import { cn } from "$lib/components/shadcn/utils.js";
	let className = undefined;
	export { className as class };
</script>

<div class={cn("text-sm [&_p]:leading-relaxed", className)} {...$$restProps}>
	<slot />
</div>
