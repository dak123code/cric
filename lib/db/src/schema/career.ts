import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const careersTable = pgTable("careers", {
  id: serial("id").primaryKey(),
  managerName: text("manager_name").notNull(),
  teamId: text("team_id").notNull(),
  teamName: text("team_name").notNull(),
  season: integer("season").notNull().default(1),
  budget: integer("budget").notNull().default(1000),
  trophies: integer("trophies").notNull().default(0),
  points: integer("points").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  fixtures: jsonb("fixtures").notNull().default([]),
  squad: jsonb("squad").notNull().default([]),
  availablePlayers: jsonb("available_players").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCareerSchema = createInsertSchema(careersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCareer = z.infer<typeof insertCareerSchema>;
export type Career = typeof careersTable.$inferSelect;
