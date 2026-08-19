#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ReputationScore {
    pub user: Address,
    pub total_deals: u32,
    pub successful_deals: u32,
    pub disputes: u32,
    pub score: u32, // 0 to 100
}

#[contracttype]
pub enum DataKey {
    Reputation(Address),
}

pub trait ReputationTrait {
    fn record_deal(env: Env, user: Address, is_successful: bool, is_dispute: bool);
    fn get_reputation(env: Env, user: Address) -> ReputationScore;
    fn get_score(env: Env, user: Address) -> u32;
}

#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationTrait for ReputationContract {
    fn record_deal(env: Env, user: Address, is_successful: bool, is_dispute: bool) {
        let key = DataKey::Reputation(user.clone());
        let mut rep = env.storage().persistent().get::<DataKey, ReputationScore>(&key).unwrap_or(ReputationScore {
            user: user.clone(),
            total_deals: 0,
            successful_deals: 0,
            disputes: 0,
            score: 100, // Default start score
        });

        rep.total_deals += 1;
        if is_successful {
            rep.successful_deals += 1;
        }
        if is_dispute {
            rep.disputes += 1;
        }

        // Calculate score (0 - 100)
        if rep.total_deals > 0 {
            let success_rate = (rep.successful_deals * 100) / rep.total_deals;
            let dispute_penalty = (rep.disputes * 20).min(50);
            rep.score = if success_rate >= dispute_penalty {
                success_rate - dispute_penalty
            } else {
                0
            };
        }

        env.storage().persistent().set(&key, &rep);

        // Emit Soroban Event
        env.events().publish((symbol_short!("rep_upd"), user), rep.score);
    }

    fn get_reputation(env: Env, user: Address) -> ReputationScore {
        let key = DataKey::Reputation(user.clone());
        env.storage().persistent().get::<DataKey, ReputationScore>(&key).unwrap_or(ReputationScore {
            user,
            total_deals: 0,
            successful_deals: 0,
            disputes: 0,
            score: 100,
        })
    }

    fn get_score(env: Env, user: Address) -> u32 {
        Self::get_reputation(env, user).score
    }
}

#[cfg(test)]
mod test;
