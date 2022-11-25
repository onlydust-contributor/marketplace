// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('graphql', (query) => {
    return cy.request({
        method: "POST",
        url: "/v1/graphql",
        body: { query: query },
    });
});

Cypress.Commands.add('graphqlAsAdmin', (query) => {
    return cy.request({
        method: "POST",
        url: "/v1/graphql",
        body: { query: query },
        headers: {
            "X-Hasura-Admin-Secret": Cypress.env("hasuraAdminSecret"),
        },
    });
});

Cypress.Commands.add('createProject', (projectName) => {
    return cy.graphqlAsAdmin(`mutation{ createProject(name: "${projectName}")}`)
        .its("body.data.createProject")
        .should("be.a", "string");
});

Cypress.Commands.add('createUser', () => {
    const email = `cypress-${Date.now()}@onlydust.xyz`;

    cy.request({
        method: 'POST',
        url: 'http://localhost:4000/signup/email-password',
        body: {
            "email": email,
            "options": {
                "allowedRoles": [
                    "me",
                    "public",
                    "user"
                ],
                "defaultRole": "public",
                "displayName": "John Smith",
                "locale": "en",
            },
            "password": "Str0ngPassw#ord-94|%"
        },
        failOnStatusCode: false
    }).then(() => {
        return cy.graphqlAsAdmin(`{
                users(where: {email: {_eq: "${email}"}}) {
                    id
                }
            }`
        )
            .its('body.data.users')
            .its(0)
            .its('id')
            .should('be.a', 'string');
    })
});

Cypress.Commands.add('addProjectLead', (projectId, userId) => {
    cy.graphqlAsAdmin(`mutation { assignProjectLead(leaderId: "${userId}", projectId: "${projectId}") }`);
});
