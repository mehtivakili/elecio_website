import assert from 'node:assert/strict';
import test from 'node:test';
import { createInvitationToken, hashInvitationToken, strongPassword } from '../src/server/auth/staff-policy';
import { can, permissionMatrix, resources, roles, type AppAction } from '../src/server/auth/rbac';

test('staff invitation tokens are high entropy, non-repeatable, and stored only by hash', () => {
  const first = createInvitationToken(); const second = createInvitationToken();
  assert.notEqual(first, second); assert.ok(first.length >= 43);
  const digest = hashInvitationToken(first); assert.match(digest, /^[a-f0-9]{64}$/); assert.equal(digest.includes(first), false);
});
test('staff password policy rejects every missing strength dimension', () => {
  assert.equal(strongPassword('Correct-Horse-7!'), true);
  for (const value of ['Short-7!', 'alllowercase-123!', 'ALLUPPERCASE-123!', 'NoNumbers-Herer!', 'NoSymbolsHere1234']) assert.equal(strongPassword(value), false);
});
test('the permission matrix has explicit entries for every role and never grants staff management to non-owners', () => {
  assert.deepEqual(Object.keys(permissionMatrix).sort(), [...roles].sort());
  for (const role of roles.filter((value) => value !== 'owner')) assert.equal(can(role, 'staff', 'manage'), false);
  for (const resource of resources) for (const action of ['read','create','update','delete','publish','manage'] as AppAction[]) assert.equal(can('owner', resource, action), true);
});
test('support assignment and editor publishing boundaries are exact', () => {
  assert.equal(can('support','leads','read','assigned'),true); assert.equal(can('support','leads','read','all'),false);
  assert.equal(can('support','content','update'),false); assert.equal(can('editor','content','publish'),true);
  assert.equal(can('editor','leads','read'),false); assert.equal(can('admin','integrations','manage'),false);
});
