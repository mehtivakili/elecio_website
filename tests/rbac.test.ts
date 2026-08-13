import assert from 'node:assert/strict';
import test from 'node:test';
import { can, getPermission, resources } from '../src/server/auth/rbac';

test('customers are constrained to their own protected resources', () => {
  assert.equal(can('customer', 'profile', 'read', 'own'), true);
  assert.equal(can('customer', 'profile', 'read', 'all'), false);
  assert.equal(can('customer', 'content', 'read', 'all'), true);
  assert.equal(can('customer', 'content', 'publish', 'all'), false);
  assert.equal(can('customer', 'staff', 'read', 'all'), false);
});

test('support and editors cannot cross privilege domains', () => {
  assert.equal(can('support', 'leads', 'update', 'assigned'), true);
  assert.equal(can('support', 'leads', 'update', 'all'), false);
  assert.equal(can('support', 'content', 'publish', 'all'), false);
  assert.equal(can('editor', 'content', 'publish', 'all'), true);
  assert.equal(can('editor', 'users', 'read', 'all'), false);
});

test('admins cannot configure integrations or staff, while owners can', () => {
  assert.equal(can('admin', 'integrations', 'manage', 'all'), false);
  assert.equal(can('admin', 'staff', 'manage', 'all'), false);
  for (const resource of resources) {
    assert.equal(getPermission('owner', resource)?.scope, 'all');
    assert.equal(can('owner', resource, 'manage', 'all'), true);
  }
});
