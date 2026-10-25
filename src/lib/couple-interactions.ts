import { supabase } from "./supabase";
import type {
  AvatarConfig,
  AvatarRecord,
  GestureKind,
  PartnerGesture,
} from "./avatars";

export interface CoupleInteractionStore {
  load(
    userId: string,
  ): Promise<{ avatars: AvatarRecord[]; inbox: PartnerGesture[] }>;
  saveAvatar(userId: string, avatar: AvatarConfig): Promise<void>;
  send(kind: GestureKind): Promise<void>;
  acknowledge(id: string): Promise<void>;
}
export const coupleInteractions: CoupleInteractionStore = {
  async load(userId) {
    if (!supabase) throw new Error("Could not open your little space.");
    const [avatars, inbox] = await Promise.all([
      supabase.from("avatars").select("*"),
      supabase
        .from("partner_gestures")
        .select("id,sender_id,recipient_id,kind,created_at")
        .eq("recipient_id", userId)
        .is("read_at", null)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    const error = avatars.error || inbox.error;
    if (error)
      throw new Error(
        ["42P01", "PGRST205"].includes(error.code)
          ? "Avatar sharing will be ready after this update is published."
          : "Could not load your avatars and little love. Try again in a moment.",
      );
    return { avatars: avatars.data || [], inbox: inbox.data || [] };
  },
  async saveAvatar(userId, avatar) {
    if (!supabase) throw new Error("Could not save your avatar.");
    const { error } = await supabase
      .from("avatars")
      .upsert({ user_id: userId, ...avatar });
    if (error)
      throw new Error(
        "Could not save your avatar. Your changes are still here to try again.",
      );
  },
  async send(kind) {
    if (!supabase) throw new Error("Could not send your little love.");
    const { error } = await supabase.rpc("send_partner_gesture", {
      gesture_kind: kind,
    });
    if (error)
      throw new Error(
        error.message === "A little pause, please"
          ? "Give your person a moment ♡ You can send another in 10 seconds."
          : error.message === "Enough love for today"
            ? "You’ve sent lots of love today. More tomorrow ♡"
            : "Your little love could not be sent. Please try again.",
      );
  },
  async acknowledge(id) {
    if (!supabase) throw new Error("Could not tuck this away.");
    const { error } = await supabase
      .from("partner_gestures")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error("Could not tuck this away. Please try again.");
  },
};
