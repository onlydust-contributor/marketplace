use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct Config {
	pub url: String,
	pub connection_retry_interval_ms: u64,
	pub connection_retry_count: usize,
}
