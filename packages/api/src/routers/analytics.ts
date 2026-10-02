import { events, getDb, membershipSettings, memberships } from "@amgclub/db";
import { and, asc, desc, eq, gte, sql } from "drizzle-orm";

import { adminProcedure, router } from "../index";
import { type EventDTO, toEventDTO } from "./events";
import { type MemberDTO, toMemberDTO } from "./members";
import { settingsDefaults } from "./settings";

export type { EventDTO, MemberDTO };

export type OverviewDTO = {
	memberships: {
		total: number;
		active: number;
		inReview: number;
		paused: number;
		canceled: number;
		expiringSoon: number;
		totalRevenue: number;
		mrr: number;
		/** canceled ÷ (active + canceled), as a percentage (0-100). */
		churnRate: number;
	};
	events: {
		total: number;
		active: number;
		paused: number;
		canceled: number;
		completed: number;
		upcoming: number;
		totalAttendees: number;
	};
	upcomingEvents: EventDTO[];
	recentMembers: MemberDTO[];
	expiringSoonDays: number;
};

export const analyticsRouter = router({
	overview: adminProcedure.query(async (): Promise<OverviewDTO> => {
		const db = getDb();

		const [settingsRow] = await db
			.select({ expiringSoonDays: membershipSettings.expiringSoonDays })
			.from(membershipSettings)
			.where(eq(membershipSettings.id, 1))
			.limit(1);
		const expiringSoonDays =
			settingsRow?.expiringSoonDays ?? settingsDefaults.expiringSoonDays;

		const memberStatsQuery = db
			.select({
				total: sql<number>`count(*)::int`,
				active: sql<number>`count(*) filter (where ${memberships.status} = 'active')::int`,
				inReview: sql<number>`count(*) filter (where ${memberships.status} = 'in_review')::int`,
				paused: sql<number>`count(*) filter (where ${memberships.status} = 'paused')::int`,
				canceled: sql<number>`count(*) filter (where ${memberships.status} = 'canceled')::int`,
				expiringSoon: sql<number>`count(*) filter (
					where ${memberships.status} = 'active'
					and ${memberships.endDate} <= current_date + make_interval(days => ${expiringSoonDays})
				)::int`,
				// All-time collected revenue: every membership that has been billed
				// (active now, or ended later as paused/canceled).
				totalRevenue: sql<number>`coalesce(sum(${memberships.price}) filter (
					where ${memberships.status} in ('active', 'paused', 'canceled')
				), 0)::float`,
				// Normalized monthly recurring revenue of active memberships.
				mrr: sql<number>`coalesce(sum(
					case ${memberships.plan}
						when 'monthly' then ${memberships.price}
						else ${memberships.price} / 12
					end
				) filter (where ${memberships.status} = 'active'), 0)::float`,
			})
			.from(memberships);

		const eventStatsQuery = db
			.select({
				total: sql<number>`count(*)::int`,
				active: sql<number>`count(*) filter (where ${events.status} = 'active')::int`,
				paused: sql<number>`count(*) filter (where ${events.status} = 'paused')::int`,
				canceled: sql<number>`count(*) filter (where ${events.status} = 'canceled')::int`,
				completed: sql<number>`count(*) filter (where ${events.status} = 'completed')::int`,
				upcoming: sql<number>`count(*) filter (
					where ${events.status} = 'active' and ${events.eventDate} >= current_date
				)::int`,
				totalAttendees: sql<number>`coalesce(sum(${events.totalAttendees}) filter (
					where ${events.status} = 'active' and ${events.eventDate} >= current_date
				), 0)::int`,
			})
			.from(events);

		const upcomingEventsQuery = db
			.select()
			.from(events)
			.where(
				and(
					eq(events.status, "active"),
					gte(events.eventDate, sql`current_date`),
				),
			)
			.orderBy(asc(events.eventDate), asc(events.startTime))
			.limit(5);

		const recentMembersQuery = db
			.select()
			.from(memberships)
			.orderBy(desc(memberships.createdAt))
			.limit(5);

		const [[memberStats], [eventStats], upcomingEventRows, recentMemberRows] =
			await Promise.all([
				memberStatsQuery,
				eventStatsQuery,
				upcomingEventsQuery,
				recentMembersQuery,
			]);

		const active = memberStats?.active ?? 0;
		const canceled = memberStats?.canceled ?? 0;
		const churnBase = active + canceled;

		return {
			memberships: {
				total: memberStats?.total ?? 0,
				active,
				inReview: memberStats?.inReview ?? 0,
				paused: memberStats?.paused ?? 0,
				canceled,
				expiringSoon: memberStats?.expiringSoon ?? 0,
				totalRevenue: memberStats?.totalRevenue ?? 0,
				mrr: memberStats?.mrr ?? 0,
				churnRate: churnBase === 0 ? 0 : (canceled / churnBase) * 100,
			},
			events: {
				total: eventStats?.total ?? 0,
				active: eventStats?.active ?? 0,
				paused: eventStats?.paused ?? 0,
				canceled: eventStats?.canceled ?? 0,
				completed: eventStats?.completed ?? 0,
				upcoming: eventStats?.upcoming ?? 0,
				totalAttendees: eventStats?.totalAttendees ?? 0,
			},
			upcomingEvents: upcomingEventRows.map(toEventDTO),
			recentMembers: recentMemberRows.map(toMemberDTO),
			expiringSoonDays,
		};
	}),
});
