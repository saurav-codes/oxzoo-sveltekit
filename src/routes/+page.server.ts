import { env } from "$env/dynamic/private";

// GREETING_TAG must be read at request time so ox runtime env changes show up without a rebuild.
export const prerender = false;
export const ssr = true;

export function load() {
	return { greetingTag: env.GREETING_TAG ?? "" };
}
