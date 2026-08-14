import { randomUUID } from 'node:crypto';
import type { Knex } from 'knex';

const roles = ['customer', 'support', 'editor', 'admin', 'owner'] as const;

export async function up(knex: Knex): Promise<void> {
  const trx = knex;
    await trx.schema.createTable('auth_users', (table) => {
      table.uuid('id').primary();
      table.string('name', 160).notNullable();
      table.string('email', 320).notNullable().unique();
      table.boolean('email_verified').notNullable().defaultTo(false);
      table.string('image', 2_048);
      table.string('phone_number', 20).unique();
      table.boolean('phone_number_verified').notNullable().defaultTo(false);
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
    });

    await trx.schema.createTable('auth_sessions', (table) => {
      table.uuid('id').primary();
      table.uuid('user_id').notNullable().references('id').inTable('auth_users').onDelete('CASCADE');
      table.string('token', 512).notNullable().unique();
      table.timestamp('expires_at', { useTz: true }).notNullable().index();
      table.string('ip_address', 64);
      table.text('user_agent');
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
      table.index(['user_id', 'expires_at']);
    });

    await trx.schema.createTable('auth_accounts', (table) => {
      table.uuid('id').primary();
      table.uuid('user_id').notNullable().references('id').inTable('auth_users').onDelete('CASCADE');
      table.string('account_id', 320).notNullable();
      table.string('provider_id', 120).notNullable();
      table.text('access_token');
      table.text('refresh_token');
      table.text('id_token');
      table.timestamp('access_token_expires_at', { useTz: true });
      table.timestamp('refresh_token_expires_at', { useTz: true });
      table.text('scope');
      table.text('password');
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
      table.unique(['provider_id', 'account_id']);
      table.index('user_id');
    });

    await trx.schema.createTable('auth_verifications', (table) => {
      table.uuid('id').primary();
      table.string('identifier', 512).notNullable().index();
      table.text('value').notNullable();
      table.timestamp('expires_at', { useTz: true }).notNullable().index();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
    });

    await trx.schema.createTable('user_profiles', (table) => {
      table.uuid('user_id').primary().references('id').inTable('auth_users').onDelete('CASCADE');
      table.string('role', 20).notNullable().defaultTo('customer');
      table.string('company_name', 200);
      table.string('locale', 5).notNullable().defaultTo('fa');
      table.boolean('is_active').notNullable().defaultTo(true);
      table.timestamp('last_login_at', { useTz: true });
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
      table.check(`role in (${roles.map((role) => `'${role}'`).join(', ')})`);
      table.check("locale in ('fa', 'en')");
      table.index(['role', 'is_active']);
    });

    await trx.schema.createTable('user_consents', (table) => {
      table.uuid('id').primary();
      table.uuid('user_id').notNullable().references('id').inTable('auth_users').onDelete('CASCADE');
      table.string('document_type', 40).notNullable();
      table.string('document_version', 40).notNullable();
      table.timestamp('accepted_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
      table.timestamp('withdrawn_at', { useTz: true });
      table.string('ip_hash', 64);
      table.string('user_agent_hash', 64);
      table.json('metadata').notNullable();
      table.unique(['user_id', 'document_type', 'document_version']);
      table.index(['document_type', 'document_version']);
    });

    await trx.schema.createTable('audit_events', (table) => {
      table.uuid('id').primary();
      table.uuid('actor_user_id').references('id').inTable('auth_users').onDelete('SET NULL');
      table.string('actor_role', 20);
      table.string('action', 120).notNullable();
      table.string('resource', 120).notNullable();
      table.string('resource_id', 160);
      table.string('outcome', 20).notNullable();
      table.uuid('request_id').notNullable();
      table.string('ip_hash', 64);
      table.json('metadata').notNullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(trx.fn.now());
      table.check("outcome in ('success', 'failure', 'denied')");
      table.index(['actor_user_id', 'created_at']);
      table.index(['resource', 'resource_id', 'created_at']);
      table.index(['action', 'outcome', 'created_at']);
      table.index('request_id');
    });

    await trx.raw(`
      create trigger audit_events_no_update
      before update on audit_events
      for each row
      signal sqlstate '45000' set message_text = 'audit_events is append-only'
    `);
    await trx.raw(`
      create trigger audit_events_no_delete
      before delete on audit_events
      for each row
      signal sqlstate '45000' set message_text = 'audit_events is append-only'
    `);

    const legacyUsers = await trx('admin_users').select('*').orderBy('id');
    const legacyToAuth = new Map<number, string>();
    for (const legacy of legacyUsers) {
      const userId = randomUUID();
      legacyToAuth.set(legacy.id, userId);
      await trx('auth_users').insert({
        id: userId,
        name: legacy.name,
        email: String(legacy.email).trim().toLowerCase(),
        email_verified: false,
        created_at: legacy.created_at ?? trx.fn.now(),
        updated_at: legacy.updated_at ?? trx.fn.now(),
      });
      await trx('auth_accounts').insert({
        id: randomUUID(),
        user_id: userId,
        account_id: userId,
        provider_id: 'credential',
        password: legacy.password_hash,
        created_at: legacy.created_at ?? trx.fn.now(),
        updated_at: legacy.updated_at ?? trx.fn.now(),
      });
      await trx('user_profiles').insert({
        user_id: userId,
        role: legacy.role === 'admin' ? 'admin' : 'editor',
        last_login_at: legacy.last_login_at,
        created_at: legacy.created_at ?? trx.fn.now(),
        updated_at: legacy.updated_at ?? trx.fn.now(),
      });
    }

    await trx.schema.alterTable('posts', (table) => {
      table.uuid('author_user_id').references('id').inTable('auth_users').onDelete('SET NULL');
    });
    for (const [legacyId, authId] of legacyToAuth) {
      await trx('posts').where('author_id', legacyId).update({ author_user_id: authId });
    }
    await trx.schema.alterTable('posts', (table) => {
      table.dropForeign('author_id');
      table.dropColumn('author_id');
      table.index('author_user_id');
    });
    await trx.schema.dropTable('admin_users');
}

export async function down(knex: Knex): Promise<void> {
  const trx = knex;
    await trx.schema.createTable('admin_users', (table) => {
      table.increments('id').primary();
      table.string('email').notNullable().unique();
      table.string('password_hash').notNullable();
      table.string('name').notNullable();
      table.enu('role', ['admin', 'editor']).notNullable().defaultTo('editor');
      table.timestamp('last_login_at');
      table.timestamps(true, true);
    });

    const staff = await trx('user_profiles as profile')
      .join('auth_users as user', 'user.id', 'profile.user_id')
      .leftJoin('auth_accounts as account', function joinCredential() {
        this.on('account.user_id', '=', 'user.id').andOnVal('account.provider_id', '=', 'credential');
      })
      .whereIn('profile.role', ['editor', 'admin', 'owner'])
      .select(
        'user.id as user_id',
        'user.email',
        'user.name',
        'profile.role',
        'profile.last_login_at',
        'profile.created_at',
        'profile.updated_at',
        'account.password'
      );

    const authToLegacy = new Map<string, number>();
    for (const user of staff) {
      const [legacyId] = await trx('admin_users')
        .insert({
          email: user.email,
          password_hash: user.password ?? 'ACCOUNT_REQUIRES_PASSWORD_RESET',
          name: user.name,
          role: user.role === 'editor' ? 'editor' : 'admin',
          last_login_at: user.last_login_at,
          created_at: user.created_at,
          updated_at: user.updated_at,
        });
      authToLegacy.set(user.user_id, legacyId);
    }

    await trx.schema.alterTable('posts', (table) => {
      table.integer('author_id').unsigned().references('id').inTable('admin_users').onDelete('SET NULL');
    });
    for (const [authId, legacyId] of authToLegacy) {
      await trx('posts').where('author_user_id', authId).update({ author_id: legacyId });
    }
    await trx.schema.alterTable('posts', (table) => {
      table.dropForeign('author_user_id');
      table.dropColumn('author_user_id');
    });

    await trx.raw('drop trigger if exists audit_events_no_delete');
    await trx.raw('drop trigger if exists audit_events_no_update');
    await trx.schema.dropTable('audit_events');
    await trx.schema.dropTable('user_consents');
    await trx.schema.dropTable('user_profiles');
    await trx.schema.dropTable('auth_verifications');
    await trx.schema.dropTable('auth_accounts');
    await trx.schema.dropTable('auth_sessions');
    await trx.schema.dropTable('auth_users');
}
