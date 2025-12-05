
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/(marketing)" | "/(auth)" | "/" | "/(marketing)/about" | "/api" | "/api/auth" | "/api/auth/login" | "/api/auth/logout" | "/api/auth/me" | "/api/auth/register" | "/api/workspaces" | "/api/workspaces/[id]" | "/api/workspaces/[id]/categories" | "/api/workspaces/[id]/notes" | "/api/workspaces/[id]/notes/[noteId]" | "/app" | "/(marketing)/features" | "/(auth)/login" | "/(marketing)/pricing" | "/(auth)/register";
		RouteParams(): {
			"/api/workspaces/[id]": { id: string };
			"/api/workspaces/[id]/categories": { id: string };
			"/api/workspaces/[id]/notes": { id: string };
			"/api/workspaces/[id]/notes/[noteId]": { id: string; noteId: string }
		};
		LayoutParams(): {
			"/(marketing)": Record<string, never>;
			"/(auth)": Record<string, never>;
			"/": { id?: string; noteId?: string };
			"/(marketing)/about": Record<string, never>;
			"/api": { id?: string; noteId?: string };
			"/api/auth": Record<string, never>;
			"/api/auth/login": Record<string, never>;
			"/api/auth/logout": Record<string, never>;
			"/api/auth/me": Record<string, never>;
			"/api/auth/register": Record<string, never>;
			"/api/workspaces": { id?: string; noteId?: string };
			"/api/workspaces/[id]": { id: string; noteId?: string };
			"/api/workspaces/[id]/categories": { id: string };
			"/api/workspaces/[id]/notes": { id: string; noteId?: string };
			"/api/workspaces/[id]/notes/[noteId]": { id: string; noteId: string };
			"/app": Record<string, never>;
			"/(marketing)/features": Record<string, never>;
			"/(auth)/login": Record<string, never>;
			"/(marketing)/pricing": Record<string, never>;
			"/(auth)/register": Record<string, never>
		};
		Pathname(): "/" | "/about" | "/about/" | "/api" | "/api/" | "/api/auth" | "/api/auth/" | "/api/auth/login" | "/api/auth/login/" | "/api/auth/logout" | "/api/auth/logout/" | "/api/auth/me" | "/api/auth/me/" | "/api/auth/register" | "/api/auth/register/" | "/api/workspaces" | "/api/workspaces/" | `/api/workspaces/${string}` & {} | `/api/workspaces/${string}/` & {} | `/api/workspaces/${string}/categories` & {} | `/api/workspaces/${string}/categories/` & {} | `/api/workspaces/${string}/notes` & {} | `/api/workspaces/${string}/notes/` & {} | `/api/workspaces/${string}/notes/${string}` & {} | `/api/workspaces/${string}/notes/${string}/` & {} | "/app" | "/app/" | "/features" | "/features/" | "/login" | "/login/" | "/pricing" | "/pricing/" | "/register" | "/register/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/IMAGE_SPECS.md" | "/favicon.svg" | "/robots.txt" | "/sidebar-icon.svg" | string & {};
	}
}