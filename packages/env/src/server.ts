/// <reference path="../env.d.ts" />

type EnvValue = Env[keyof Env];

function createEnvProxy(
	getValue: (key: keyof Env & string) => EnvValue | undefined,
) {
	return new Proxy({} as Env, {
		get(_target, prop) {
			if (typeof prop !== "string") {
				return undefined;
			}

			return getValue(prop as keyof Env & string);
		},
	});
}

function resolveEnvValue(key: keyof Env & string): EnvValue | undefined {
	return process.env[key];
}

// Next.js (Vercel) injects env vars directly into process.env.
export async function getEnvAsync() {
	return createEnvProxy(resolveEnvValue);
}

export const env = createEnvProxy(resolveEnvValue);
