import { all, save } from "./db.js";
import { uid, nowIso } from "./util.js";

// Append a server-side activity entry. Keeps the feed capped at 200 rows.
export function logActivity(type, description, user) {
  const list = all("activity");
  list.unshift({ id: uid("a"), timestamp: nowIso(), type, description, user });
  if (list.length > 200) list.length = 200;
  save();
}
