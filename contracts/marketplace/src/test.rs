#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env, String};

#[test]
fn test_marketplace_listing_and_purchase() {
    let env = Env::default();
    env.mock_all_auths();

    let rep_id = env.register_contract(None, reputation_contract::ReputationContract);
    let escrow_id = env.register_contract(None, escrow_contract::EscrowContract);
    let market_id = env.register_contract(None, MarketplaceContract);

    let client = MarketplaceContractClient::new(&env, &market_id);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    let arbitrator = Address::generate(&env);

    let title = String::from_str(&env, "Soroban Smart Contract Audit");
    let desc = String::from_str(&env, "Full security audit for Soroban Rust smart contracts.");

    // Create listing
    let listing_id = client.create_listing(&seller, &title, &desc, &2500, &0);
    assert_eq!(listing_id, 1);

    let listing = client.get_listing(&1);
    assert_eq!(listing.price, 2500);
    assert_eq!(listing.total_sales, 0);

    // Buy service via Inter-Contract call
    let new_escrow_id = client.buy_service(&buyer, &1, &escrow_id, &arbitrator, &rep_id);
    assert_eq!(new_escrow_id, 1);

    let listing_after = client.get_listing(&1);
    assert_eq!(listing_after.total_sales, 1);
}
