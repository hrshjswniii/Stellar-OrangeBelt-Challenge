#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};
use reputation_contract::ReputationContractClient;

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum EscrowStatus {
    Funded = 0,
    WorkSubmitted = 1,
    Approved = 2,
    Disputed = 3,
    Resolved = 4,
    Refunded = 5,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct EscrowAccount {
    pub id: u64,
    pub buyer: Address,
    pub seller: Address,
    pub arbitrator: Address,
    pub amount: i128,
    pub service_id: u64,
    pub status: EscrowStatus,
    pub created_at: u64,
    pub reputation_contract: Address,
}

#[contracttype]
pub enum DataKey {
    Escrow(u64),
    EscrowCounter,
}

pub trait EscrowTrait {
    fn create_escrow(
        env: Env,
        buyer: Address,
        seller: Address,
        arbitrator: Address,
        amount: i128,
        service_id: u64,
        reputation_contract: Address,
    ) -> u64;
    fn submit_work(env: Env, escrow_id: u64, seller: Address);
    fn approve_and_release(env: Env, escrow_id: u64, buyer: Address);
    fn raise_dispute(env: Env, escrow_id: u64, caller: Address);
    fn resolve_dispute(env: Env, escrow_id: u64, arbitrator: Address, release_to_seller: bool);
    fn get_escrow(env: Env, escrow_id: u64) -> EscrowAccount;
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowTrait for EscrowContract {
    fn create_escrow(
        env: Env,
        buyer: Address,
        seller: Address,
        arbitrator: Address,
        amount: i128,
        service_id: u64,
        reputation_contract: Address,
    ) -> u64 {
        buyer.require_auth();

        let mut counter: u64 = env.storage().instance().get(&DataKey::EscrowCounter).unwrap_or(0);
        counter += 1;

        let escrow = EscrowAccount {
            id: counter,
            buyer: buyer.clone(),
            seller: seller.clone(),
            arbitrator: arbitrator.clone(),
            amount,
            service_id,
            status: EscrowStatus::Funded,
            created_at: env.ledger().timestamp(),
            reputation_contract,
        };

        env.storage().persistent().set(&DataKey::Escrow(counter), &escrow);
        env.storage().instance().set(&DataKey::EscrowCounter, &counter);

        // Emit Soroban Event
        env.events().publish((symbol_short!("esc_init"), counter), (buyer, seller, amount));

        counter
    }

    fn submit_work(env: Env, escrow_id: u64, seller: Address) {
        seller.require_auth();
        let key = DataKey::Escrow(escrow_id);
        let mut escrow = env.storage().persistent().get::<DataKey, EscrowAccount>(&key).expect("Escrow not found");

        assert_eq!(escrow.seller, seller, "Unauthorized seller");
        assert_eq!(escrow.status, EscrowStatus::Funded, "Invalid status for work submission");

        escrow.status = EscrowStatus::WorkSubmitted;
        env.storage().persistent().set(&key, &escrow);

        // Emit Event
        env.events().publish((symbol_short!("wrk_sub"), escrow_id), seller);
    }

    fn approve_and_release(env: Env, escrow_id: u64, buyer: Address) {
        buyer.require_auth();
        let key = DataKey::Escrow(escrow_id);
        let mut escrow = env.storage().persistent().get::<DataKey, EscrowAccount>(&key).expect("Escrow not found");

        assert_eq!(escrow.buyer, buyer, "Unauthorized buyer");
        assert!(
            escrow.status == EscrowStatus::Funded || escrow.status == EscrowStatus::WorkSubmitted,
            "Cannot approve escrow in current state"
        );

        escrow.status = EscrowStatus::Approved;
        env.storage().persistent().set(&key, &escrow);

        // Inter-contract call to Reputation Contract to reward seller & buyer
        let rep_client = ReputationContractClient::new(&env, &escrow.reputation_contract);
        rep_client.record_deal(&escrow.seller, &true, &false);
        rep_client.record_deal(&escrow.buyer, &true, &false);

        // Emit Event
        env.events().publish((symbol_short!("esc_appr"), escrow_id), (buyer, escrow.seller, escrow.amount));
    }

    fn raise_dispute(env: Env, escrow_id: u64, caller: Address) {
        caller.require_auth();
        let key = DataKey::Escrow(escrow_id);
        let mut escrow = env.storage().persistent().get::<DataKey, EscrowAccount>(&key).expect("Escrow not found");

        assert!(caller == escrow.buyer || caller == escrow.seller, "Unauthorized caller");
        assert!(
            escrow.status == EscrowStatus::Funded || escrow.status == EscrowStatus::WorkSubmitted,
            "Cannot dispute escrow in current state"
        );

        escrow.status = EscrowStatus::Disputed;
        env.storage().persistent().set(&key, &escrow);

        // Inter-contract call to Reputation Contract recording dispute
        let rep_client = ReputationContractClient::new(&env, &escrow.reputation_contract);
        rep_client.record_deal(&caller, &false, &true);

        // Emit Event
        env.events().publish((symbol_short!("esc_disp"), escrow_id), caller);
    }

    fn resolve_dispute(env: Env, escrow_id: u64, arbitrator: Address, release_to_seller: bool) {
        arbitrator.require_auth();
        let key = DataKey::Escrow(escrow_id);
        let mut escrow = env.storage().persistent().get::<DataKey, EscrowAccount>(&key).expect("Escrow not found");

        assert_eq!(escrow.arbitrator, arbitrator, "Unauthorized arbitrator");
        assert_eq!(escrow.status, EscrowStatus::Disputed, "Escrow is not under dispute");

        if release_to_seller {
            escrow.status = EscrowStatus::Resolved;
        } else {
            escrow.status = EscrowStatus::Refunded;
        }

        env.storage().persistent().set(&key, &escrow);

        // Emit Event
        env.events().publish((symbol_short!("esc_res"), escrow_id), (arbitrator, release_to_seller));
    }

    fn get_escrow(env: Env, escrow_id: u64) -> EscrowAccount {
        let key = DataKey::Escrow(escrow_id);
        env.storage().persistent().get::<DataKey, EscrowAccount>(&key).expect("Escrow not found")
    }
}

#[cfg(test)]
mod test;
