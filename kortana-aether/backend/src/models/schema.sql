-- Database schema for Aether Platform

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    kyc_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    dinar_balance DECIMAL(18, 8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties Table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    country VARCHAR(100),
    price_usd DECIMAL(18, 2),
    total_tokens BIGINT,
    token_contract_address VARCHAR(255),
    images JSONB, -- Array of image URLs
    legal_documents JSONB, -- Array of document URLs
    listing_status VARCHAR(50) DEFAULT 'active', -- 'active', 'sold', 'pending'
    golden_visa_eligible BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ownership Table
CREATE TABLE ownership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    token_balance DECIMAL(18, 8),
    ownership_percentage DECIMAL(5, 2),
    transaction_hash VARCHAR(255),
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES users(id),
    property_id UUID REFERENCES properties(id),
    tokens_transferred DECIMAL(18, 8),
    dinar_amount DECIMAL(18, 8),
    transaction_type VARCHAR(50), -- 'purchase', 'sale', 'rental_distribution'
    tx_hash VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rental Payouts Table
CREATE TABLE rental_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    holder_id UUID REFERENCES users(id),
    amount DECIMAL(18, 8),
    percentage DECIMAL(5, 2),
    payout_date TIMESTAMP,
    tx_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
