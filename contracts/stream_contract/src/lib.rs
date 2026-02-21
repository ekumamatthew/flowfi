#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, Symbol};

#[contracttype]
pub struct Stream {
    pub sender: Address,
    pub recipient: Address,
    pub rate: i128,
    pub token_address: Address,
    pub start_time: u64,
    pub duration: u64,
    pub withdrawn: i128,
}

#[contracttype]
pub enum DataKey {
    Stream(u64),
    StreamCounter,
}

#[contract]
pub struct StreamContract;

#[contractimpl]
impl StreamContract {
    pub fn create_stream(
        env: Env,
        sender: Address,
        recipient: Address,
        token_address: Address,
        amount: i128,
        duration: u64,
    ) -> u64 {
        sender.require_auth();

        let stream_id = Self::get_next_stream_id(&env);

        let token_client = token::Client::new(&env, &token_address);
        let contract_address = env.current_contract_address();
        token_client.transfer_from(&contract_address, &sender, &contract_address, &amount);

        let start_time = env.ledger().timestamp();

        let stream = Stream {
            sender: sender.clone(),
            recipient,
            rate: amount,
            token_address: token_address.clone(),
            start_time,
            duration,
            withdrawn: 0,
        };

        env.storage()
            .instance()
            .set(&DataKey::Stream(stream_id), &stream);

        env.events().publish(
            (Symbol::new(&env, "create_stream"), sender, stream_id),
            (token_address, amount, duration),
        );

        stream_id
    }

    pub fn cancel_stream(env: Env, sender: Address, stream_id: u64) {
        sender.require_auth();

        let stream: Stream = env
            .storage()
            .instance()
            .get(&DataKey::Stream(stream_id))
            .expect("Stream not found");

        if stream.sender != sender {
            panic!("Only sender can cancel stream");
        }

        let current_time = env.ledger().timestamp();
        let elapsed = if current_time > stream.start_time {
            current_time - stream.start_time
        } else {
            0
        };

        let vested_amount = if elapsed >= stream.duration {
            stream.rate
        } else {
            let vested = (stream.rate as u128 * elapsed as u128 / stream.duration as u128) as i128;
            vested.saturating_sub(stream.withdrawn)
        };

        let remainder = stream
            .rate
            .saturating_sub(stream.withdrawn)
            .saturating_sub(vested_amount);

        let token_client = token::Client::new(&env, &stream.token_address);

        if vested_amount > 0 {
            token_client.transfer(
                &env.current_contract_address(),
                &stream.recipient,
                &vested_amount,
            );
        }

        if remainder > 0 {
            token_client.transfer(&env.current_contract_address(), &sender, &remainder);
        }

        env.storage().instance().remove(&DataKey::Stream(stream_id));

        env.events().publish(
            (Symbol::new(&env, "StreamCancelled"), sender, stream_id),
            (stream.recipient, vested_amount, remainder),
        );
    }

    fn get_next_stream_id(env: &Env) -> u64 {
        let counter: u64 = env
            .storage()
            .instance()
            .get(&DataKey::StreamCounter)
            .unwrap_or(0);
        let next_id = counter + 1;
        env.storage()
            .instance()
            .set(&DataKey::StreamCounter, &next_id);
        next_id
    }

    pub fn withdraw(_env: Env, _recipient: Address, _stream_id: u64) {
        // Placeholder for withdraw logic
        // 1. Calculate claimable amount based on time delta
        // 2. Transfer tokens to recipient
        // 3. Update stream state
    }

    pub fn get_stream(env: Env, stream_id: u64) -> Option<Stream> {
        env.storage().instance().get(&DataKey::Stream(stream_id))
    }
}

mod test;
