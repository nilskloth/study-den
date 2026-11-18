/* =========================================================
   Grown-ups lock: the whole Grown-ups area (#/grown-ups…) asks
   for the upload password first, checked by api/track.php op
   "grown-ups" (wrong ones count towards the same lockout and
   alerts as uploads). Kept in memory only — a reload or a new
   tab asks again. Activity and Word lists reuse it.
   ========================================================= */

let password = "";

export const grownUpsPassword = () => password;

/* Resolves when the server accepts it; throws {code, message} otherwise. */
export async function unlockGrownUps(pw) {
  let res;
  try {
    res = await fetch("api/track.php", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op: "grown-ups", password: pw })
    });
  } catch {
    throw Object.assign(new Error("Can't reach the server — check the internet connection."), { code: "offline" });
  }
  const body = await res.json().catch(() => null);
  if (!body?.ok) throw Object.assign(new Error(body?.error?.message || "Something went wrong."), { code: body?.error?.code });
  password = pw;
}
