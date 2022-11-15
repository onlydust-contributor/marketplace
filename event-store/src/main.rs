use anyhow::Result;
use dotenv::dotenv;
use marketplace_infrastructure::tracing::Tracer;

#[tokio::main]
async fn main() -> Result<()> {
	dotenv().ok();
	let _tracer = Tracer::init("event_store")?;

	event_store::main().await
}