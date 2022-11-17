use crate::domain::*;
use marketplace_domain::{EventStore, EventStoreError};
use std::sync::Arc;
use thiserror::Error;

pub type RefreshContributors = Refresh<ContributorProfile>;

#[derive(Debug, Error)]
pub enum Error {
	#[error(transparent)]
	ProjectionRepository(#[from] ProjectionRepositoryError),
	#[error(transparent)]
	EventStore(#[from] EventStoreError),
}

#[derive(Clone)]
pub struct Refresh<P: Projection> {
	projection_repository: Arc<dyn ProjectionRepository<P>>,
	projector: Arc<dyn EventListener>,
	event_store: Arc<dyn EventStore<P::A>>,
}

impl<P: Projection> Refresh<P> {
	pub fn new(
		projection_repository: Arc<dyn ProjectionRepository<P>>,
		projector: Arc<dyn EventListener>,
		event_store: Arc<dyn EventStore<P::A>>,
	) -> Self {
		Self {
			projection_repository,
			projector,
			event_store,
		}
	}

	pub async fn refresh_projection_from_events(&self) -> Result<(), Error> {
		self.projection_repository.clear()?;

		let events = self.event_store.list()?;

		for event in events.into_iter() {
			self.projector.on_event(&event.into()).await;
		}

		Ok(())
	}
}