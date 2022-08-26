use crate::database::{init_pool, tests::init_project, Client};

use marketplace_domain::*;

#[test]
#[ignore = "require a database"]
fn store_and_find() {
	let client = Client::new(init_pool());

	let project = init_project(&client);

	let contribution1 = Contribution {
		id: 1.into(),
		project_id: project.id.to_owned(),
		..Default::default()
	};
	let contribution2 = Contribution {
		id: 2.into(),
		project_id: project.id.to_owned(),
		..Default::default()
	};

	<Client as ContributionRepository>::create(&client, contribution1.clone()).unwrap();
	<Client as ContributionRepository>::create(&client, contribution2.clone()).unwrap();

	let found_contribution =
		<Client as ContributionRepository>::find_by_id(&client, &contribution1.id).unwrap();
	assert_eq!(found_contribution, Some(contribution1));

	let found_contribution =
		<Client as ContributionRepository>::find_by_id(&client, &contribution2.id).unwrap();
	assert_eq!(found_contribution, Some(contribution2));
}
