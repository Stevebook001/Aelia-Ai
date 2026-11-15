-- AELIA Core: organizations, memberships, invitations, usage and audit foundation.
-- Migration is intentionally additive. It does not change existing account or chat behaviour.
-- Apply through the controlled database migration process; do not execute at API startup.

BEGIN;

CREATE TABLE IF NOT EXISTS aelia_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 160),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$'),
  created_by UUID NULL REFERENCES aelia_users(id) ON DELETE SET NULL,
  plan_key TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'closed')),
  settings JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(settings) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS aelia_organizations_created_by
  ON aelia_organizations(created_by, created_at DESC);

CREATE TABLE IF NOT EXISTS aelia_organization_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES aelia_organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES aelia_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'left')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS aelia_memberships_user
  ON aelia_organization_memberships(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS aelia_memberships_org
  ON aelia_organization_memberships(organization_id, status, role);

-- An organization must retain at least one active owner. Enforce this in the
-- membership-management transaction/service as well as with integration tests;
-- a row-level CHECK cannot safely enforce a cross-row invariant.

CREATE TABLE IF NOT EXISTS aelia_organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES aelia_organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL CHECK (email = lower(trim(email))),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  token_hash TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES aelia_users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_by UUID NULL REFERENCES aelia_users(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ NULL,
  revoked_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((status <> 'accepted') OR (accepted_by IS NOT NULL AND accepted_at IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS aelia_org_invitations_email
  ON aelia_organization_invitations(email, status, expires_at);
CREATE INDEX IF NOT EXISTS aelia_org_invitations_org
  ON aelia_organization_invitations(organization_id, status, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS aelia_org_one_pending_invite_per_email
  ON aelia_organization_invitations(organization_id, email)
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS aelia_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES aelia_organizations(id) ON DELETE RESTRICT,
  user_id UUID NULL REFERENCES aelia_users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  feature_key TEXT NOT NULL,
  provider TEXT NULL,
  model TEXT NULL,
  input_tokens BIGINT NOT NULL DEFAULT 0 CHECK (input_tokens >= 0),
  output_tokens BIGINT NOT NULL DEFAULT 0 CHECK (output_tokens >= 0),
  quantity NUMERIC(20, 6) NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  estimated_cost_usd NUMERIC(20, 8) NULL CHECK (estimated_cost_usd IS NULL OR estimated_cost_usd >= 0),
  settled_cost_usd NUMERIC(20, 8) NULL CHECK (settled_cost_usd IS NULL OR settled_cost_usd >= 0),
  idempotency_key TEXT NULL,
  request_id TEXT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(metadata) = 'object'),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS aelia_usage_org_time
  ON aelia_usage_events(organization_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS aelia_usage_user_time
  ON aelia_usage_events(user_id, occurred_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS aelia_usage_idempotency
  ON aelia_usage_events(organization_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS aelia_core_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NULL REFERENCES aelia_organizations(id) ON DELETE SET NULL,
  actor_user_id UUID NULL REFERENCES aelia_users(id) ON DELETE SET NULL,
  actor_type TEXT NOT NULL DEFAULT 'user'
    CHECK (actor_type IN ('user', 'system', 'api_key', 'admin')),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NULL,
  request_id TEXT NULL,
  ip_hash TEXT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(metadata) = 'object'),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS aelia_core_audit_org_time
  ON aelia_core_audit_events(organization_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS aelia_core_audit_actor_time
  ON aelia_core_audit_events(actor_user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS aelia_core_audit_resource
  ON aelia_core_audit_events(resource_type, resource_id, occurred_at DESC);

COMMIT;
