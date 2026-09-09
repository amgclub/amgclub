import { protectedProcedure, publicProcedure, router } from "../index";
import { analyticsRouter } from "./analytics";
import { eventsRouter } from "./events";
import { membersRouter } from "./members";
import { settingsRouter } from "./settings";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	members: membersRouter,
	events: eventsRouter,
	settings: settingsRouter,
	analytics: analyticsRouter,
});
export type AppRouter = typeof appRouter;
