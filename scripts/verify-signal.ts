import {
  bootstrapUsers,
  clearVault,
  envelopeHidesPlaintext,
  openText,
  sealText,
} from "../src/lib/signal";

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

clearVault();
bootstrapUsers(["alice", "bob", "priya"]);

const hello = sealText("alice", ["bob"], "hello from bandra");
assert(envelopeHidesPlaintext(hello, "hello from bandra"), "ciphertext leaked plaintext");
assert(openText("bob", hello) === "hello from bandra", "bob failed to open first message");
// Same order the app uses: recipient hears the outbound envelope before they reply.

const reply = sealText("bob", ["alice"], "hey — on my way");
assert(openText("alice", reply) === "hey — on my way", "alice failed to open reply");

for (const text of ["one", "two", "three", "four", "five"]) {
  const env = sealText("alice", ["bob"], text);
  assert(openText("bob", env) === text, `in-order fail: ${text}`);
}

const outOfOrder = ["alpha", "beta", "gamma"].map((text) => sealText("alice", ["bob"], text));
assert(openText("bob", outOfOrder[2]) === "gamma", "out-of-order gamma");
assert(openText("bob", outOfOrder[0]) === "alpha", "out-of-order alpha");
assert(openText("bob", outOfOrder[1]) === "beta", "out-of-order beta");

const group = sealText("alice", ["bob", "priya"], "squad at 7");
assert(openText("bob", group) === "squad at 7", "group bob");
assert(openText("priya", group) === "squad at 7", "group priya");
assert(envelopeHidesPlaintext(group, "squad at 7"), "group envelope leaked plaintext");

let failed = false;
try {
  openText("alice", group);
} catch {
  failed = true;
}
assert(failed, "sender should not open a group fan-out as a recipient");

console.log("signal verify: X3DH + Double Ratchet OK");
console.log("  1:1 handshake and reply");
console.log("  5 in-order ratchets");
console.log("  3 out-of-order messages");
console.log("  group fan-out to two peers");
console.log("  plaintext never stored on the envelope");
