import { protectedProcedure, publicProcedure, router } from "../index";
import { analyticsRouter } from "./analytics";
import { contactRouter } from "./contact";
import { customersRouter } from "./customers";
import { eventsRouter } from "./events";
import { membersRouter } from "./members";
import { ordersRouter } from "./orders";
import { settingsRouter } from "./settings";
import { shopRouter } from "./shop";
import { storageRouter } from "./storage";

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
	storage: storageRouter,
	shop: shopRouter,
	orders: ordersRouter,
	customers: customersRouter,
	contact: contactRouter,
});
export type AppRouter = typeof appRouter;
