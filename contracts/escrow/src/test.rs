#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env};

#[test]
fn test_escrow_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    let rep_id = env.register_contract(None, reputation_contract::ReputationContract);
    let escrow_id = env.register_contract(None, EscrowContract);

    let client = EscrowContractClient::new(&env, &escrow_id);

    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    let arbitrator = Address::generate(&env);

    // Create Escrow
    let id = client.create_escrow(&buyer, &seller, &arbitrator, &500, &1, &rep_id);
    assert_eq!(id, 1);

    let esc = client.get_escrow(&1);
    assert_eq!(esc.status, EscrowStatus::Funded);

    // Submit work
    client.submit_work(&1, &seller);
    let esc_sub = client.get_escrow(&1);
    assert_eq!(esc_sub.status, EscrowStatus::WorkSubmitted);

    // Approve and release
    client.approve_and_release(&1, &buyer);
    let esc_appr = client.get_escrow(&1);
    assert_eq!(esc_appr.status, EscrowStatus::Approved);
}

#[test]
fn test_escrow_dispute_and_resolution() {
    let env = Env::default();
    env.mock_all_auths();

    let rep_id = env.register_contract(None, reputation_contract::ReputationContract);
    let escrow_id = env.register_contract(None, EscrowContract);

    let client = EscrowContractClient::new(&env, &escrow_id);

    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    let arbitrator = Address::generate(&env);

    // Create Escrow
    let id = client.create_escrow(&buyer, &seller, &arbitrator, &1000, &2, &rep_id);
    assert_eq!(id, 1);

    // Raise dispute
    client.raise_dispute(&1, &buyer);
    let esc_disp = client.get_escrow(&1);
    assert_eq!(esc_disp.status, EscrowStatus::Disputed);

    // Arbitrator resolves in favor of seller
    client.resolve_dispute(&1, &arbitrator, &true);
    let esc_res = client.get_escrow(&1);
    assert_eq!(esc_res.status, EscrowStatus::Resolved);
}
