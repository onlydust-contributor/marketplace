use std::future::Future;

use async_trait::async_trait;
use event_listeners::domain::{GithubEvent, GithubRepoIndex, IndexerState};

use super::Result;

pub struct Indexer<I: super::Indexer, Fut: Future<Output = bool>, F: Fn() -> Fut> {
	indexer: I,
	guard: F,
}

#[async_trait]
impl<I: super::Indexer, Fut: Future<Output = bool> + Send, F: Fn() -> Fut + Send + Sync>
	super::Indexer for Indexer<I, Fut, F>
{
	async fn index(
		&self,
		repo_index: GithubRepoIndex,
	) -> Result<(Vec<GithubEvent>, Option<IndexerState>)> {
		if (self.guard)().await {
			self.indexer.index(repo_index).await
		} else {
			Ok((vec![], None))
		}
	}
}

pub trait Guarded<I: super::Indexer> {
	fn guarded<Fut: Future<Output = bool>, F: Fn() -> Fut>(self, guard: F) -> Indexer<I, Fut, F>;
}

impl<I: super::Indexer> Guarded<I> for I {
	fn guarded<Fut: Future<Output = bool>, F: Fn() -> Fut>(self, guard: F) -> Indexer<I, Fut, F> {
		Indexer {
			indexer: self,
			guard,
		}
	}
}