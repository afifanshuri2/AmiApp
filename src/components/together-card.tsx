"use client";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { relationshipDuration, todayDate } from "../lib/relationship";
export function TogetherCard({ since }: { since: string }) {
  const [today, setToday] = useState(todayDate);
  useEffect(() => {
    const timer = window.setInterval(() => setToday(todayDate()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <section className="together-card">
      <Heart size={22} aria-hidden="true" />
      <div>
        <p className="eyebrow">TOGETHER FOR</p>
        <h2>{relationshipDuration(since, today)}</h2>
        <p className="muted">
          Since{" "}
          {new Date(since + "T00:00:00").toLocaleDateString(undefined, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          · and counting ♡
        </p>
      </div>
    </section>
  );
}
