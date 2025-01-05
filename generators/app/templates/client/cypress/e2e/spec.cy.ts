describe("Check main pages", () => {
  it("finds the User button and visits the login page", () => {
    cy.visit("http://localhost");
    cy.contains("Template app");
  });
});