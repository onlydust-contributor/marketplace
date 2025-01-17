use std::{sync::Arc, time::Duration};

use anyhow::Result;
use domain::{GithubRepoId, GithubUserId, LogErr};
use indexer::{
	composite::Arced, guarded::Guarded, logged::Logged, published::Published,
	with_state::WithState, Indexable, Indexer,
};
use infrastructure::{amqp, database, github};
use olog::{error, info, IntoField};

use crate::{listeners::github::Event as GithubEvent, Config};

mod indexer;

pub async fn bootstrap(config: Config) -> Result<()> {
	let github: Arc<github::Client> = github::RoundRobinClient::new(config.github)?.into();
	let database = Arc::new(database::Client::new(database::init_pool(config.database)?));
	let event_bus = Arc::new(amqp::Bus::new(config.amqp).await?);

	let repo_indexer = indexer::composite::Indexer::new(vec![
		indexer::repo::Indexer::new(github.clone(), database.clone())
			.logged()
			.published(event_bus.clone())
			.with_state()
			.arced(),
		indexer::issues::Indexer::new(github.clone(), database.clone())
			.logged()
			.published(event_bus.clone())
			.with_state()
			.arced(),
		indexer::pull_requests::Indexer::new(github.clone(), database.clone())
			.logged()
			.published(event_bus.clone())
			.with_state()
			.arced(),
		indexer::contributors::Indexer::new(github.clone(), database.clone())
			.logged()
			.published(event_bus.clone())
			.with_state()
			.arced(),
	])
	.guarded(|| check_github_rate_limit(github.clone()));

	let user_indexer = indexer::user::Indexer::new(github.clone(), database.clone())
		.logged()
		.published(event_bus.clone())
		.with_state()
		.guarded(|| check_github_rate_limit(github.clone()));

	loop {
		info!("🎶 Still alive 🎶");
		index_all::<GithubRepoId>(&repo_indexer, database.clone()).await?;
		index_all::<GithubUserId>(&user_indexer, database.clone()).await?;
		sleep().await;
	}
}

async fn index_all<Id: Indexable>(
	indexer: &dyn Indexer<Id>,
	repository: Arc<dyn indexer::Repository<Id>>,
) -> Result<Vec<GithubEvent>> {
	let mut events = vec![];

	for id in repository.list_items_to_index()? {
		match indexer.index(id).await {
			Ok(item_events) => events.extend(item_events),
			Err(error) => error!(
				error = error.to_field(),
				indexed_item_id = id.to_string(),
				indexed_item_id_type = std::any::type_name::<Id>(),
				"Error while indexing item"
			),
		}
	}

	Ok(events)
}

async fn sleep() {
	let seconds = std::env::var("GITHUB_EVENTS_INDEXER_SLEEP_DURATION")
		.unwrap_or_default()
		.parse()
		.unwrap_or(60);

	tokio::time::sleep(Duration::from_secs(seconds)).await;
}

async fn check_github_rate_limit(github: Arc<github::Client>) -> bool {
	let guard = std::env::var("GITHUB_RATE_LIMIT_GUARD")
		.unwrap_or_default()
		.parse()
		.unwrap_or(1000);

	let remaining = github
		.octocrab()
		.ratelimit()
		.get()
		.await
		.log_err(|e| {
			olog::error!(
				error = e.to_field(),
				"Failed while checking github rate limit"
			)
		})
		.map(|rate_limit| rate_limit.rate.remaining)
		.unwrap_or_default();

	remaining > guard
}
