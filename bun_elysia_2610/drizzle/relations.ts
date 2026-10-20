import { relations } from "drizzle-orm/relations";
import { tBoard, tComment, tUser } from "./schema";

export const tCommentRelations = relations(tComment, ({one}) => ({
	tBoard: one(tBoard, {
		fields: [tComment.boardId],
		references: [tBoard.id]
	}),
	tUser: one(tUser, {
		fields: [tComment.userId],
		references: [tUser.id]
	}),
}));

export const tBoardRelations = relations(tBoard, ({one, many}) => ({
	tComments: many(tComment),
	tUser: one(tUser, {
		fields: [tBoard.userId],
		references: [tUser.id]
	}),
}));

export const tUserRelations = relations(tUser, ({many}) => ({
	tComments: many(tComment),
	tBoards: many(tBoard),
}));