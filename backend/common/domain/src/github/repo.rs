use derive_more::{AsRef, Display, From, Into};
use diesel_derive_newtype::DieselNewType;
use serde::{Deserialize, Serialize};
use url::Url;

#[derive(Debug, Clone, Serialize, Deserialize, Hash, PartialEq, Eq)]
pub struct Repo {
	pub id: Id,
	pub owner: String,
	pub name: String,
	pub logo_url: Url,
	pub html_url: Url,
	pub description: String,
	pub stars: i32,
	pub forks_count: i32,
}

#[derive(
	Debug,
	Clone,
	Copy,
	Default,
	Serialize,
	Deserialize,
	PartialEq,
	Eq,
	Display,
	From,
	Into,
	AsRef,
	Hash,
	DieselNewType,
)]
pub struct Id(i64);

impl From<u64> for Id {
	fn from(value: u64) -> Self {
		(value as i64).into()
	}
}
