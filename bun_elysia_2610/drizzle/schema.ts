import { pgTable, check, serial, varchar, timestamp, foreignKey, integer, index, text } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const tUser = pgTable("t_user", {
	id: serial().primaryKey().notNull(),
	username: varchar(),
	password: varchar({ length: 2000 }),
	phoneno: varchar(),
	gender: varchar().default('m'),
	createdDt: timestamp("created_dt", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	check("t_user_gender_check", sql`(gender)::text = ANY ((ARRAY['m'::character varying, 'f'::character varying])::text[])`),
]);

export const tComment = pgTable("t_comment", {
	id: serial().primaryKey().notNull(),
	boardId: integer("board_id").notNull(),
	userId: integer("user_id").notNull(),
	cmt: varchar(),
	createdDt: timestamp("created_dt", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.boardId],
			foreignColumns: [tBoard.id],
			name: "fk_cmt_board"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [tUser.id],
			name: "fk_cmt_user"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const tBoard = pgTable("t_board", {
	id: serial().primaryKey().notNull(),
	title: varchar(),
	content: text(),
	userId: integer("user_id").notNull(),
	createdDt: timestamp("created_dt", { withTimezone: true, mode: 'string' }).defaultNow(),
	viewcnt: integer().default(0),
	likecnt: integer().default(0),
}, (table) => [
	index("idx_board_created_dt").using("btree", table.createdDt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [tUser.id],
			name: "fk_board_user"
		}).onUpdate("cascade").onDelete("cascade"),
	check("t_board_viewcnt_check", sql`viewcnt >= 0`),
	check("t_board_likecnt_check", sql`likecnt >= 0`),
]);
