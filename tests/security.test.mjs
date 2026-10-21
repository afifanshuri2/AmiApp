import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

await test("PostgreSQL: pairing, permissions, username uniqueness, and couple isolation", async () => {
  const check = async (name, fn) => {
    await fn();
    console.log("  PASS: " + name);
  };
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth;
   create table auth.users(id uuid primary key, email text unique, raw_user_meta_data jsonb);
   create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
   create function auth.jwt() returns jsonb language sql stable as $$ select jsonb_build_object('role',current_setting('request.jwt.claim.role',true)) $$;
   grant usage on schema auth to authenticated, anon,service_role; grant execute on function auth.uid(),auth.jwt() to authenticated, anon,service_role;
   create schema net; create table net.http_request_queue(id bigint);
   create function net.http_post(url text,body jsonb default '{}',params jsonb default '{}',headers jsonb default '{}',timeout_milliseconds integer default 2000) returns bigint language sql as $$ select 1::bigint $$;
   create schema vault;create table vault.decrypted_secrets(id uuid primary key,decrypted_secret text);
   create function vault.create_secret(secret text,name text) returns uuid language sql as $$ insert into vault.decrypted_secrets values(gen_random_uuid(),secret) returning id $$;`);
    for (const file of readdirSync("supabase/migrations")
      .filter((f) => f.endsWith(".sql"))
      .sort())
      // Infrastructure only is stubbed: PGlite has no pg_net worker or encrypted Vault.
      await db.exec(
        readFileSync(`supabase/migrations/${file}`, "utf8").replace(
          "create extension if not exists pg_net;",
          "",
        ),
      );
    const ids = Array.from(
      { length: 7 },
      (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
    );
    for (let i = 0; i < ids.length; i++)
      await db.query(`insert into auth.users values($1,$2,$3::jsonb)`, [
        ids[i],
        `user${i}@users.amiapp.invalid`,
        JSON.stringify({
          username: `user${i}`,
          role: i % 2 === 0 ? "husband" : "wife",
        }),
      ]);
    async function as(index, sql, params = []) {
      await db.exec("reset role");
      await db.query(`select set_config('request.jwt.claim.sub',$1,false)`, [
        index === null ? "" : ids[index],
      ]);
      await db.exec(`set role ${index === null ? "anon" : "authenticated"}`);
      await db.query("select set_config('request.jwt.claim.role',$1,false)", [
        index === null ? "anon" : "authenticated",
      ]);
      return db.query(sql, params);
    }
    const code = async (i) =>
      (await as(i, "select public.generate_pair_key() as key")).rows[0].key;
    const join = async (i, key) =>
      (await as(i, "select public.join_pair($1) as joined", [key])).rows[0]
        .joined;
    let aKey, bKey, coupleA, entryId;
    await check(
      "unpaired users see only their own profile and cannot create data",
      async () => {
        assert.equal(
          (await as(0, "select * from public.profiles")).rows.length,
          1,
        );
        await assert.rejects(
          as(
            0,
            `insert into public.entries(couple_id,kind,title,created_by) values($1,'Goals','Blocked',$2)`,
            [ids[0], ids[0]],
          ),
        );
      },
    );
    await check(
      "unauthenticated callers cannot read profiles or generate invitations",
      async () => {
        await assert.rejects(as(null, "select * from public.profiles"));
        await assert.rejects(as(null, "select public.generate_pair_key()"));
      },
    );
    await check(
      "username uniqueness is enforced inside the database",
      async () => {
        await db.exec("reset role");
        await assert.rejects(
          db.query(
            "insert into auth.users values(gen_random_uuid(),$1,$2::jsonb)",
            [
              "different@users.amiapp.invalid",
              JSON.stringify({ username: "user0", role: "wife" }),
            ],
          ),
        );
        await assert.rejects(
          db.query(
            "insert into public.profiles(id,username,role) values(gen_random_uuid(),$1,$2)",
            ["user0", "wife"],
          ),
        );
      },
    );
    await check(
      "keys have six digits; own key and same-role pairing are rejected",
      async () => {
        aKey = await code(0);
        assert.match(aKey, /^\d{6}$/);
        assert.equal(await join(0, aKey), false);
        assert.equal(await join(2, aKey), false);
      },
    );
    await check(
      "matching forms exactly two members and consumes the key",
      async () => {
        assert.equal(await join(1, aKey), true);
        const profiles = (await as(0, "select * from public.profiles")).rows;
        assert.equal(profiles.length, 2);
        coupleA = profiles[0].couple_id;
        assert.ok(coupleA);
        assert.equal(profiles[1].couple_id, coupleA);
        assert.equal(await join(3, aKey), false);
        await assert.rejects(as(0, "select public.generate_pair_key()"));
      },
    );
    await check("a second couple forms independently", async () => {
      bKey = await code(2);
      assert.equal(await join(3, bKey), true);
      assert.equal(
        (await as(2, "select * from public.profiles")).rows.length,
        2,
      );
    });
    await check(
      "partners share entries; other couples cannot read or mutate them",
      async () => {
        entryId = (
          await as(
            0,
            `insert into public.entries(couple_id,kind,title,created_by) values($1,'Goals','Our private goal',$2) returning id`,
            [coupleA, ids[0]],
          )
        ).rows[0].id;
        assert.equal(
          (await as(1, "select * from public.entries")).rows.length,
          1,
        );
        assert.equal(
          (await as(2, "select * from public.entries")).rows.length,
          0,
        );
        assert.equal(
          (
            await as(
              2,
              "update public.entries set done=true where id=$1 returning id",
              [entryId],
            )
          ).rows.length,
          0,
        );
        assert.equal(
          (
            await as(2, "delete from public.entries where id=$1 returning id", [
              entryId,
            ])
          ).rows.length,
          0,
        );
        await assert.rejects(
          as(
            2,
            `insert into public.entries(couple_id,kind,title,created_by) values($1,'Goals','Intrusion',$2)`,
            [coupleA, ids[2]],
          ),
        );
        assert.equal(
          (
            await as(
              1,
              "update public.entries set done=true where id=$1 returning done",
              [entryId],
            )
          ).rows[0].done,
          true,
        );
      },
    );
    await check(
      "membership, authorship, and invitation hashes cannot be tampered with",
      async () => {
        await assert.rejects(
          as(0, "update public.profiles set couple_id=null"),
        );
        await assert.rejects(as(0, "select * from private.invitations"));
        await assert.rejects(
          as(0, "update public.entries set created_by=$1 where id=$2", [
            ids[2],
            entryId,
          ]),
        );
        await assert.rejects(
          as(
            0,
            `insert into public.entries(couple_id,kind,title,created_by) values($1,'Goals','Forged author',$2)`,
            [coupleA, ids[1]],
          ),
        );
      },
    );
    await check(
      "expired keys and invalid guesses fail; rate limits survive failed attempts",
      async () => {
        const expired = await code(4);
        await db.exec("reset role");
        await db.query(
          `update private.invitations set expires_at=now()-interval '1 minute' where owner_id=$1`,
          [ids[4]],
        );
        assert.equal(await join(5, expired), false);
        const fresh = await code(4);
        for (let i = 0; i < 10; i++) assert.equal(await join(5, "bad"), false);
        assert.equal(await join(5, fresh), false);
        await db.exec("reset role");
        await db.query(
          `update private.pair_limits set window_start=now()-interval '16 minutes' where user_id=$1`,
          [ids[5]],
        );
        assert.equal(await join(5, fresh), true);
      },
    );
    await check("replacing a key invalidates its predecessor", async () => {
      const old = await code(6);
      const replacement = await code(6);
      assert.match(replacement, /^\d{6}$/);
      await db.exec("reset role");
      const rows = (
        await db.query(
          "select key_hash=sha256(convert_to($1,'UTF8')) as matches from private.invitations where owner_id=$2",
          [old, ids[6]],
        )
      ).rows;
      assert.equal(rows.length, 1);
      assert.equal(rows[0].matches, old === replacement);
    });
    await check(
      "relationship date is optional, shared, editable, removable, and isolated",
      async () => {
        assert.equal(
          (await as(0, "select * from public.couple_settings")).rows.length,
          0,
        );
        await as(0, "select public.save_relationship_date(null)");
        assert.equal(
          (await as(1, "select together_since from public.couple_settings"))
            .rows[0].together_since,
          null,
        );
        await as(1, "select public.save_relationship_date('2020-01-01')");
        assert.equal(
          (
            await as(
              0,
              "select together_since::text as date from public.couple_settings",
            )
          ).rows[0].date,
          "2020-01-01",
        );
        assert.equal(
          (await as(2, "select * from public.couple_settings")).rows.length,
          0,
        );
        await assert.rejects(
          as(2, "insert into public.couple_settings values($1,null)", [
            coupleA,
          ]),
        );
        await assert.rejects(
          as(0, "select public.save_relationship_date('2099-01-01')"),
        );
        await as(0, "select public.save_relationship_date(null)");
        await assert.rejects(
          as(null, "select public.save_relationship_date(null)"),
        );
        await assert.rejects(
          as(6, "select public.save_relationship_date(null)"),
        );
      },
    );
    await check(
      "push credentials are inaccessible to users, including authenticated users",
      async () => {
        await assert.rejects(as(0, "select public.push_credentials()"));
        await assert.rejects(as(null, "select public.push_credentials()"));
        await assert.rejects(as(0, "select * from private.push_config"));
        await db.exec("reset role");
        await db.query(
          "select set_config('request.jwt.claim.role','service_role',false)",
        );
        await db.exec("set role service_role");
        const result = await db.query(
          "select public.push_credentials('test-public','test-private') as config",
        );
        assert.equal(result.rows[0].config.publicKey, "test-public");
        assert.equal(result.rows[0].config.privateKey, "test-private");
      },
    );
    await check(
      "new ShortNotes notify only the partner and protect unread state and endpoints",
      async () => {
        await as(
          1,
          "insert into public.push_subscriptions(user_id,endpoint,p256dh,auth) values($1,$2,$3,$4)",
          [
            ids[1],
            "https://web.push.apple.com/test",
            "a".repeat(87),
            "b".repeat(22),
          ],
        );
        await assert.rejects(
          as(
            0,
            "insert into public.push_subscriptions(user_id,endpoint,p256dh,auth) values($1,$2,$3,$4)",
            [
              ids[0],
              "https://127.0.0.1/internal",
              "a".repeat(87),
              "b".repeat(22),
            ],
          ),
        );
        const note = (
          await as(
            0,
            "insert into public.entries(couple_id,kind,title,created_by) values($1,'ShortNotes','A private note',$2) returning id",
            [coupleA, ids[0]],
          )
        ).rows[0].id;
        assert.equal(
          (await as(0, "select * from public.note_notifications")).rows.length,
          0,
        );
        assert.equal(
          (await as(2, "select * from public.note_notifications")).rows.length,
          0,
        );
        assert.equal(
          (await as(2, "select * from public.push_subscriptions")).rows.length,
          0,
        );
        const notifications = (
          await as(1, "select * from public.note_notifications")
        ).rows;
        assert.equal(notifications.length, 1);
        assert.equal(notifications[0].entry_id, note);
        assert.equal(
          (
            await as(
              0,
              "update public.note_notifications set read_at=now() returning id",
            )
          ).rows.length,
          0,
        );
        assert.equal(
          (
            await as(
              1,
              "update public.note_notifications set read_at=now() returning id",
            )
          ).rows.length,
          1,
        );
        await assert.rejects(
          as(1, "update public.note_notifications set dispatched_at=now()"),
        );
        await as(0, "delete from public.entries where id=$1", [note]);
        assert.equal(
          (await as(1, "select * from public.note_notifications")).rows.length,
          0,
        );
      },
    );
    await check(
      "food categories and locations are shared only inside the couple",
      async () => {
        const food = (
          await as(
            0,
            "insert into public.entries(couple_id,kind,title,created_by,category,place_name,location) values($1,'FoodToTry','Nasi kerabu',$2,'Kampung','Warung QA','Kuala Lumpur') returning id",
            [coupleA, ids[0]],
          )
        ).rows[0].id;
        assert.equal(
          (
            await as(
              1,
              "select category,location from public.entries where id=$1",
              [food],
            )
          ).rows[0].category,
          "Kampung",
        );
        assert.equal(
          (await as(2, "select * from public.entries where id=$1", [food])).rows
            .length,
          0,
        );
        await as(
          1,
          "update public.entries set category='Malay',done=true where id=$1",
          [food],
        );
        assert.equal(
          (await as(0, "select done from public.entries where id=$1", [food]))
            .rows[0].done,
          true,
        );
        await assert.rejects(
          as(
            0,
            "insert into public.entries(couple_id,kind,title,created_by) values($1,'FoodToTry','Missing place',$2)",
            [coupleA, ids[0]],
          ),
        );
        await as(0, "select public.save_relationship_date('2020-01-01')");
        await as(1, "select public.save_relationship_date(null,true)");
        assert.equal(
          (
            await as(
              0,
              "select together_since::text as date from public.couple_settings",
            )
          ).rows[0].date,
          "2020-01-01",
        );
      },
    );
  } finally {
    await db.close();
  }
});
