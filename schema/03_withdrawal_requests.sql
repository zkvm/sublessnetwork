-- Withdrawal requests table: tracks user withdrawal requests from custodial wallets

CREATE TABLE withdrawal_requests (
    -- Primary identification
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_id               UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    
    -- Withdrawal details
    amount_usdc_cents       INTEGER NOT NULL CHECK (amount_usdc_cents > 0),
    destination_address     TEXT NOT NULL,              -- User's external wallet address
    chain                   TEXT NOT NULL DEFAULT 'solana',
    network                 TEXT NOT NULL DEFAULT 'mainnet',
    
    -- Processing status
    status                  TEXT NOT NULL DEFAULT 'pending',
    -- pending: request submitted, awaiting review
    -- approved: approved by system/admin
    -- processing: transaction being sent
    -- completed: transaction confirmed on-chain
    -- failed: transaction failed
    -- rejected: request rejected
    -- cancelled: cancelled by user
    
    -- Transaction information
    tx_hash                 TEXT UNIQUE,                -- On-chain withdrawal transaction
    tx_timestamp            TIMESTAMPTZ,
    tx_fee_lamports         BIGINT,                     -- Network fee paid
    tx_confirmed            BOOLEAN DEFAULT FALSE,
    
    -- Review and approval
    reviewed_by_user_id     BIGINT REFERENCES users(id),
    reviewed_at             TIMESTAMPTZ,
    rejection_reason        TEXT,
    
    -- Security checks
    risk_score              DECIMAL(3,2),               -- 0.00 - 1.00 (fraud detection)
    security_hold           BOOLEAN DEFAULT FALSE,
    security_hold_reason    TEXT,
    security_hold_until     TIMESTAMPTZ,
    
    -- Metadata
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at            TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN (
        'pending', 'approved', 'processing', 'completed', 'failed', 'rejected', 'cancelled'
    ))
);

-- Indexes
CREATE INDEX idx_withdrawal_requests_user_id ON withdrawal_requests(user_id, created_at DESC);
CREATE INDEX idx_withdrawal_requests_wallet_id ON withdrawal_requests(wallet_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX idx_withdrawal_requests_created_at ON withdrawal_requests(created_at DESC);

-- Trigger
CREATE TRIGGER update_withdrawal_requests_updated_at BEFORE UPDATE ON withdrawal_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE withdrawal_requests IS 'Tracks user requests to withdraw earnings from custodial wallets';
