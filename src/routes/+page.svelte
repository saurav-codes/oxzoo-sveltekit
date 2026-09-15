<script>
	// importing PUBLIC_GREETING_TAG makes the build fail loudly when the variable is unset;
	// the rendered line reads the same var via import.meta.env (vite inlines it as a literal,
	// so the baked value survives as one string in the client bundle)
	import { PUBLIC_GREETING_TAG } from "$env/static/public";

	let { data } = $props();
</script>

<svelte:head>
	<title>oxzoo-sveltekit ({PUBLIC_GREETING_TAG})</title>
</svelte:head>

<main>
	<h1>oxzoo-sveltekit</h1>
	<p>backend: hello world oxzoo-sveltekit_{data.greetingTag}</p>
	<p>{`frontend: hello world oxzoo-sveltekit_${import.meta.env.PUBLIC_GREETING_TAG}`}</p>
</main>

<style>
	main {
		max-width: 36rem;
		margin: 4rem auto;
		padding: 0 1rem;
		font-family: system-ui, sans-serif;
		color: #222;
	}
	h1 {
		color: #ff3e00;
	}
</style>
