// Removes PayHere sandbox (test) payments from the database before PayHere goes live.
//
//   npm run payments:list                                         ← shows every payment
//   npm run payments:remove -- --order=BCJ-MUVIULU7-D400FE        ← shows what would be removed (nothing is changed)
//   npm run payments:remove -- --order=BCJ-MUVIULU7-D400FE --yes  ← really removes it
//
// Options:
//   --order=ID1,ID2     remove these order numbers
//   --email=a@b.c       remove every payment of this (test) member
//   --yes               actually delete (without it, the script only shows what it would do)
//
// Interviews linked to a removed payment are kept; they are simply no longer counted against a fee.
import { db } from "../src/lib/db";

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=") ?? "";
const orders = arg("order").split(",").map((s) => s.trim()).filter(Boolean);
const email = arg("email").trim().toLowerCase();
const really = process.argv.includes("--yes");
const listOnly = process.argv.includes("--list");

const money = (c: number, cur: string) => `${cur} ${(c / 100).toFixed(2)}`;

async function main() {
  const where = listOnly
    ? {}
    : { OR: [...(orders.length ? [{ orderId: { in: orders } }] : []), ...(email ? [{ user: { email } }] : [])] };
  if (!listOnly && !orders.length && !email) {
    console.log("Give --order=ORDER_ID or --email=member@example.com (or use --list). Nothing was changed.");
    return;
  }
  const rows = await db.payment.findMany({
    where,
    orderBy: { id: "asc" },
    include: { user: { select: { email: true } }, _count: { select: { interviews: true } } },
  });
  if (!rows.length) {
    console.log(listOnly ? "There are no payments." : "No matching payments found. Nothing was changed.");
    return;
  }
  console.table(
    rows.map((p) => ({
      id: p.id,
      order: p.orderId,
      member: p.user.email,
      kind: p.kind,
      amount: money(p.amountCents, p.currency),
      status: p.status,
      method: p.method ?? "",
      paid: p.paidAt?.toISOString().slice(0, 16).replace("T", " ") ?? "",
      interviews: p._count.interviews,
    })),
  );
  if (listOnly) return;
  if (orders.length) {
    const missing = orders.filter((o) => !rows.some((r) => r.orderId === o));
    if (missing.length) console.log(`Not found: ${missing.join(", ")}`);
  }
  if (!really) {
    console.log(`\n${rows.length} payment(s) would be removed. Run again with --yes to remove them.`);
    return;
  }
  const { count } = await db.payment.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
  console.log(`\nRemoved ${count} payment(s).`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
