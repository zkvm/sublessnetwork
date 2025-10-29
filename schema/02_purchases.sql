-- Purchases table: tracks all content purchases and on-chain transactions
-- Simplified version with essential payment information only

CREATE TABLE purchases (
    -- Primary identification
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id             UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    
    -- Payment information
    price_paid_cents        INTEGER NOT NULL,           -- Amount paid in cents
    currency                TEXT NOT NULL DEFAULT 'USDC',
    chain                   TEXT NOT NULL DEFAULT 'solana',
    
    -- On-chain transaction proof
    tx_hash                 TEXT NOT NULL UNIQUE,       -- Transaction hash (proof of payment)
    tx_from_address         TEXT NOT NULL,              -- Buyer's wallet address
    tx_to_address           TEXT NOT NULL,              -- Seller's wallet address
    tx_amount               BIGINT NOT NULL,            -- Amount in blockchain native units
    tx_timestamp            TIMESTAMPTZ NOT NULL,       -- Blockchain transaction time
    tx_block_number         BIGINT,                     -- Block number
    
    -- Status
    status                  TEXT NOT NULL DEFAULT 'pending',
    -- pending: payment initiated, awaiting confirmation
    -- confirmed: payment verified on-chain
    -- completed: content delivered successfully
    
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'completed')),
    CONSTRAINT positive_price CHECK (price_paid_cents >= 0)
);

-- Indexes
CREATE INDEX idx_purchases_resource_id ON purchases(resource_id, created_at DESC);
CREATE INDEX idx_purchases_tx_hash ON purchases(tx_hash);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_created_at ON purchases(created_at DESC);
CREATE INDEX idx_purchases_tx_from_address ON purchases(tx_from_address);

-- Trigger
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comment
COMMENT ON TABLE purchases IS 'Records all content purchases with on-chain payment proofs (Solana)';
COMMENT ON COLUMN purchases.tx_hash IS 'Solana transaction signature proving payment';
