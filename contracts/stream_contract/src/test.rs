#![cfg(test)]

extern crate std;

use super::*;
use soroban_sdk::{
    testutils::{Address as _, MockAuth, MockAuthInvoke},
    Address, Env, IntoVal,
};

#[test]
fn withdraw_succeeds_for_authorized_recipient() {
    let env = Env::default();
    let contract_id = env.register(StreamContract, ());
    let client = StreamContractClient::new(&env, &contract_id);

    let recipient = Address::generate(&env);
    let stream_id = 1_u64;

    client
        .mock_auths(&[MockAuth {
            address: &recipient,
            invoke: &MockAuthInvoke {
                contract: &contract_id,
                fn_name: "withdraw",
                args: (recipient.clone(), stream_id).into_val(&env),
                sub_invokes: &[],
            },
        }])
        .withdraw(&recipient, &stream_id);

    let auths = env.auths();
    assert_eq!(auths.len(), 1);
    assert_eq!(auths[0].0, recipient);
}

#[test]
fn withdraw_fails_for_non_recipient_and_authorized_call_still_succeeds() {
    let env = Env::default();
    let contract_id = env.register(StreamContract, ());
    let client = StreamContractClient::new(&env, &contract_id);

    let recipient = Address::generate(&env);
    let attacker = Address::generate(&env);
    let stream_id = 1_u64;

    let unauthorized_result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        client
            .mock_auths(&[MockAuth {
                address: &attacker,
                invoke: &MockAuthInvoke {
                    contract: &contract_id,
                    fn_name: "withdraw",
                    args: (recipient.clone(), stream_id).into_val(&env),
                    sub_invokes: &[],
                },
            }])
            .withdraw(&recipient, &stream_id);
    }));
    assert!(unauthorized_result.is_err());

    client
        .mock_auths(&[MockAuth {
            address: &recipient,
            invoke: &MockAuthInvoke {
                contract: &contract_id,
                fn_name: "withdraw",
                args: (recipient.clone(), stream_id).into_val(&env),
                sub_invokes: &[],
            },
        }])
        .withdraw(&recipient, &stream_id);

    let auths = env.auths();
    assert_eq!(auths.len(), 1);
    assert_eq!(auths[0].0, recipient);
}
