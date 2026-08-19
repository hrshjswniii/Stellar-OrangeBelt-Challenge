#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env};

#[test]
fn test_reputation_flow() {
    let env = Env::default();
    let contract_id = env.register_contract(None, ReputationContract);
    let client = ReputationContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    // Default reputation
    assert_eq!(client.get_score(&user), 100);

    // Record successful deal
    client.record_deal(&user, &true, &false);
    let rep = client.get_reputation(&user);
    assert_eq!(rep.total_deals, 1);
    assert_eq!(rep.successful_deals, 1);
    assert_eq!(rep.score, 100);

    // Record a disputed deal
    client.record_deal(&user, &false, &true);
    let rep2 = client.get_reputation(&user);
    assert_eq!(rep2.total_deals, 2);
    assert_eq!(rep2.disputes, 1);
    // Success rate: (1*100)/2 = 50. Dispute penalty: 1*20 = 20. Score = 30.
    assert_eq!(rep2.score, 30);
}
