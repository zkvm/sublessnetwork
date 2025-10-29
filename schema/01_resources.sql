-- Resources table: stores KOL submitted content with encryption and proof
-- Each resource represents one piece of paid content

CREATE TABLE resources (
    -- Primary identification
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Source message tracking (for deduplication)
    source_platform         TEXT NOT NULL DEFAULT 'twitter',  -- twitter, telegram, etc.
    source_message_id       TEXT NOT NULL,              -- Twitter DM message ID (for deduplication)
    
    -- Content storage (encrypted)
    content_ciphertext      TEXT NOT NULL,              -- Encrypted content (base64 or hex)
    content_iv              TEXT NOT NULL,              -- Initialization vector for decryption
    content_type            TEXT NOT NULL DEFAULT 'text/plain', -- MIME type: text/plain, image/png, video/mp4
    content_hash            TEXT,                       -- SHA256 hash of plaintext (for integrity)
    
    -- Proof mechanism (one-time binding token)
    proof_token             TEXT NOT NULL UNIQUE,       -- Random proof token (shown to KOL)
    proof_hash              TEXT NOT NULL UNIQUE,       -- HMAC-SHA256 hash of proof (stored for verification)
    proof_salt              TEXT NOT NULL,              -- Salt used for proof hashing
    proof_issued_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    proof_used_at           TIMESTAMPTZ,                -- When proof was redeemed (tweet posted)
    
    -- Publishing lifecycle
    status                  TEXT NOT NULL DEFAULT 'draft', 
    -- draft: content uploaded, not yet published
    -- published: content posted and verified
    -- suspended: temporarily hidden
    -- deleted: soft deleted
    
    tweet_id                TEXT UNIQUE,                -- Twitter tweet ID (once published)
    tweet_url               TEXT,                       -- Full tweet URL
    tweet_verified_at       TIMESTAMPTZ,                -- When id+proof verified successfully
    
    -- Pricing and monetization
    price_usd_cents         INTEGER NOT NULL CHECK (price_usd_cents >= 0), -- Price in cents (e.g., 20 = $0.20)
    currency                TEXT NOT NULL DEFAULT 'USDC', -- USDC, USDT, etc.
    chain                   TEXT NOT NULL DEFAULT 'base',  -- base, ethereum, solana
    
    -- Purchase statistics
    total_purchases         INTEGER NOT NULL DEFAULT 0,
    total_revenue_cents     BIGINT NOT NULL DEFAULT 0,   -- Total earned in cents
    
    -- Watermarking (for tracking leaks)
    watermark_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
    watermark_seed          TEXT,                        -- Seed for generating unique watermarks
    
    -- Metadata
    summary                 TEXT,                        -- Optional summary (shown in tweet)
    tags                    TEXT[],                      -- Searchable tags
    
    -- Timestamps
    deleted_at              TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'locked', 'suspended', 'deleted')),
    CONSTRAINT tweet_required_when_published CHECK (
        (status = 'published' AND tweet_id IS NOT NULL) OR 
        (status != 'published')
    )
);

-- Indexes for common queries
CREATE INDEX idx_resources_user_id ON resources(user_id, created_at DESC);
CREATE INDEX idx_resources_status ON resources(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_resources_tweet_id ON resources(tweet_id) WHERE tweet_id IS NOT NULL;
CREATE INDEX idx_resources_proof_hash ON resources(proof_hash);
CREATE INDEX idx_resources_created_at ON resources(created_at DESC);
CREATE UNIQUE INDEX idx_resources_source_message_id ON resources(source_platform, source_message_id);

-- Trigger to update updated_at
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comment
COMMENT ON TABLE resources IS 'Stores encrypted paid content submitted by KOLs via DM';
COMMENT ON COLUMN resources.source_message_id IS 'Platform-specific message ID for deduplication';
COMMENT ON COLUMN resources.proof_token IS 'Cleartext proof shown to KOL (not stored after initial response)';
COMMENT ON COLUMN resources.proof_hash IS 'Hashed proof for verification when tweet is detected';
COMMENT ON COLUMN resources.watermark_seed IS 'Unique seed to embed buyer-specific watermarks';
