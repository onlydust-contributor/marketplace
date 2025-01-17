mod config;
pub mod enums;
mod error;
pub mod repositories;
pub mod schema;

mod model;
pub use model::{ImmutableModel, ImmutableRepository, Model, Repository};

#[cfg(test)]
mod tests;
use anyhow::anyhow;
use diesel::{
	pg::PgConnection,
	r2d2::{self, ConnectionManager},
};
use diesel_migrations::EmbeddedMigrations;
use olog::{error, IntoField};

pub use self::{
	config::Config,
	error::{Error as DatabaseError, Result},
};
use crate::diesel_migrations::MigrationHarness;

pub type Pool = r2d2::Pool<ConnectionManager<PgConnection>>;
type PooledConnection = r2d2::PooledConnection<ConnectionManager<PgConnection>>;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

pub fn run_migrations(pool: &Pool) {
	let mut connection = pool.get().expect("Unable to get connection from pool");
	connection.run_pending_migrations(MIGRATIONS).expect("diesel migration failure");
}

pub struct Client {
	pool: Pool,
}

impl Client {
	pub fn new(pool: Pool) -> Self {
		Self { pool }
	}
}

impl Client {
	pub fn connection(&self) -> Result<PooledConnection> {
		self.pool.get().map_err(|e| {
			error!(
				error = e.to_field(),
				"Failed to connect to get connection out of pool"
			);
			DatabaseError::Connection(e.into())
		})
	}

	pub fn run_migrations(&self) -> Result<()> {
		let mut connection = self.connection()?;
		connection.run_pending_migrations(MIGRATIONS).map_err(|e| {
			error!(error = e.to_field(), "Failed to run migrations");
			DatabaseError::Migration(anyhow!(e))
		})?;
		Ok(())
	}
}

pub fn init_pool(config: Config) -> Result<Pool> {
	let manager = ConnectionManager::<PgConnection>::new(config.url);
	let pool = Pool::builder()
		.max_size(config.pool_max_size)
		.build(manager)
		.map_err(|e| DatabaseError::Pool(anyhow!(e)))?;

	Ok(pool)
}
