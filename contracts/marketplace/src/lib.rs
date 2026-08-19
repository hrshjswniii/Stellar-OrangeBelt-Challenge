#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String};
use escrow_contract::EscrowContractClient;

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ServiceListing {
    pub id: u64,
    pub seller: Address,
    pub title: String,
    pub description: String,
    pub price: i128,
    pub category: u32,
    pub active: bool,
    pub total_sales: u32,
}

#[contracttype]
pub enum DataKey {
    Listing(u64),
    ListingCounter,
}

pub trait MarketplaceTrait {
    fn create_listing(
        env: Env,
        seller: Address,
        title: String,
        description: String,
        price: i128,
        category: u32,
    ) -> u64;
    fn update_listing(env: Env, listing_id: u64, seller: Address, price: i128, active: bool);
    fn buy_service(
        env: Env,
        buyer: Address,
        listing_id: u64,
        escrow_contract: Address,
        arbitrator: Address,
        reputation_contract: Address,
    ) -> u64;
    fn get_listing(env: Env, listing_id: u64) -> ServiceListing;
}

#[contract]
pub struct MarketplaceContract;

#[contractimpl]
impl MarketplaceTrait for MarketplaceContract {
    fn create_listing(
        env: Env,
        seller: Address,
        title: String,
        description: String,
        price: i128,
        category: u32,
    ) -> u64 {
        seller.require_auth();

        let mut counter: u64 = env.storage().instance().get(&DataKey::ListingCounter).unwrap_or(0);
        counter += 1;

        let listing = ServiceListing {
            id: counter,
            seller: seller.clone(),
            title,
            description,
            price,
            category,
            active: true,
            total_sales: 0,
        };

        env.storage().persistent().set(&DataKey::Listing(counter), &listing);
        env.storage().instance().set(&DataKey::ListingCounter, &counter);

        // Emit Soroban Event
        env.events().publish((symbol_short!("list_crt"), counter), (seller, price));

        counter
    }

    fn update_listing(env: Env, listing_id: u64, seller: Address, price: i128, active: bool) {
        seller.require_auth();
        let key = DataKey::Listing(listing_id);
        let mut listing = env.storage().persistent().get::<DataKey, ServiceListing>(&key).expect("Listing not found");

        assert_eq!(listing.seller, seller, "Unauthorized seller");
        listing.price = price;
        listing.active = active;

        env.storage().persistent().set(&key, &listing);
    }

    fn buy_service(
        env: Env,
        buyer: Address,
        listing_id: u64,
        escrow_contract: Address,
        arbitrator: Address,
        reputation_contract: Address,
    ) -> u64 {
        buyer.require_auth();
        let key = DataKey::Listing(listing_id);
        let mut listing = env.storage().persistent().get::<DataKey, ServiceListing>(&key).expect("Listing not found");

        assert!(listing.active, "Listing is not active");

        // Inter-contract call to Escrow Contract
        let escrow_client = EscrowContractClient::new(&env, &escrow_contract);
        let escrow_id = escrow_client.create_escrow(
            &buyer,
            &listing.seller,
            &arbitrator,
            &listing.price,
            &listing_id,
            &reputation_contract,
        );

        listing.total_sales += 1;
        env.storage().persistent().set(&key, &listing);

        // Emit Event
        env.events().publish((symbol_short!("svc_purc"), listing_id), (buyer, escrow_id));

        escrow_id
    }

    fn get_listing(env: Env, listing_id: u64) -> ServiceListing {
        let key = DataKey::Listing(listing_id);
        env.storage().persistent().get::<DataKey, ServiceListing>(&key).expect("Listing not found")
    }
}

#[cfg(test)]
mod test;
