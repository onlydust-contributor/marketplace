use crate::e2e_tests::http::{self, BACKEND_BASE_URI};
use marketplace_core::dto::Contributor;
use reqwest::StatusCode;

pub async fn get(contributor_account_address: &str) -> Contributor {
	let response = http::get(format!(
		"{BACKEND_BASE_URI}/contributors/{contributor_account_address}"
	))
	.await;

	assert_eq!(
		response.status(),
		StatusCode::OK,
		"Invalid response received from GET"
	);
	let body = response.text().await.unwrap();
	serde_json::from_str(&body).expect("Invalid contributor")
}