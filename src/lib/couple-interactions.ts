import { supabase } from "./supabase";
import type {
  AvatarConfig,
  AvatarRecord,
  GestureKind,
  PartnerGesture,
} from "./avatars";

const unavailable = (error: { code?: string }) =>
  ["42P01", "PGRST205"].includes(error.code || "")
    ? "Avatar sharing will be ready after this update is published."
    : "Could not load your avatars and little love. Try again in a moment.";

export interface CoupleInteractionStore {
  loadAvatars(): Promise<AvatarRecord[]>;
  loadInbox(userId: string): Promise<PartnerGesture[]>;
  saveAvatar(userId: string, avatar: AvatarConfig): Promise<void>;
  send(kind: GestureKind): Promise<void>;
  acknowledge(id: string): Promise<void>;
}
// Avatars and the gesture inbox change at different speeds, so each caller
// fetches only what it shows instead of sharing one double query.
export const coupleInteractions: CoupleInteractionStore = {
  async loadAvatars() {
    if (!supabase) throw new Error("Could not open your little space.");
    const { data, error } = await supabase.from("avatars").select("*");
    if (error) throw new Error(unavailable(error));
    return data || [];
  },
  async loadInbox(userId) {
    if (!supabase) throw new Error("Could not open your little space.");
    const { data, error } = await supabase
      .from("partner_gestures")
      .select("id,sender_id,recipient_id,kind,created_at")
      .eq("recipient_id", userId)
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(unavailable(error));
    return data || [];
  },
  async saveAvatar(userId, avatar) {
    if (!supabase) throw new Error("Could not save your avatar.");
    let { error } = await supabase
      .from("avatars")
      .upsert({ user_id: userId, ...avatar });
    // Until the wardrobe update is applied, the clothing and accessory columns
    // do not exist; save the classic fields so nothing is lost.
    if (error && ["PGRST204", "42703"].includes(error.code)) {
      const { clothing: _clothing, accessory: _accessory, ...classic } = avatar;
      ({ error } = await supabase
        .from("avatars")
        .upsert({ user_id: userId, ...classic }));
    }
    if (error)
      throw new Error(
        error.code === "23514"
          ? "Some of those options are not available yet. Pick a classic look for now."
          : "Could not save your avatar. Your changes are still here to try again.",
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
