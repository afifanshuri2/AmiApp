import { supabase } from "./supabase";
import type { GoalUpdate } from "./types";

export interface GoalHistoryStore {
  load(goalId: string): Promise<GoalUpdate[]>;
  add(goalId: string, description: string, progress: number): Promise<void>;
}
export const goalHistory: GoalHistoryStore = {
  async load(goalId) {
    if (!supabase) throw new Error("Could not load updates. Please try again.");
    const { data, error } = await supabase
      .from("goal_updates")
      .select("*")
      .eq("entry_id", goalId)
      .order("created_at", { ascending: false });
    if (error) throw new Error("Could not load updates. Please try again.");
    return data || [];
  },
  async add(goalId, description, progress) {
    if (!supabase)
      throw new Error("Could not save. Your update is kept; please try again.");
    const { error } = await supabase.rpc("add_goal_update", {
      goal_id: goalId,
      update_description: description,
      new_progress: progress,
    });
    if (error)
      throw new Error("Could not save. Your update is kept; please try again.");
  },
};
