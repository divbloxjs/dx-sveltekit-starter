<script>
	export let taskData;
</script>
<div class="w-full bg-card px-2 py-4">
    <p class="truncate">{taskData.status}</p>
<p class="truncate">{taskData.dueDate}</p>
<p class="truncate">{taskData.taskName}</p>
<p class="truncate">{taskData.description}</p>

</div>

<!-- Interrogate relationships in the taskData object -->
