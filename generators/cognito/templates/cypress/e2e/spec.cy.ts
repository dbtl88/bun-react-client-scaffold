const cognitoUrl = Cypress.env("VITE_COGNITO_URL");
const cognitoClientId = Cypress.env("VITE_COGNITO_CLIENT_ID");
const cognitoRedirectUri = decodeURIComponent(
  Cypress.env("VITE_COGNITO_REDIRECT_URI")
);
const cognitoLoginUrl = `${cognitoUrl}/login?client_id=${cognitoClientId}&redirect_uri=${cognitoRedirectUri}&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile`;

Cypress.env("cognitoUrl", cognitoUrl);
Cypress.env("cognitoLoginUrl", cognitoLoginUrl);

const staticUserResponse = {
  authenticated: true,
  user: {
    userId: "joebloggs",
    email: "joe@bloggs.com",
  },
};
const staticNoUserResponse = {
  authenticated: false,
  user: {},
};

describe("Check main pages", () => {
  it("finds the User button and visits the login page, stubs a basic user object, logs out and returns to login page", () => {
    cy.visit("http://localhost");
    cy.intercept(
      {
        method: "GET",
        url: `${Cypress.env("PATHNAME")}/auth/status`,
        hostname: Cypress.env("HOSTNAME"),
      },
      (req) => {
        req.reply(staticUserResponse);
      }
    );
    // check that status call results in User being set
    cy.contains("joe@blog");
    cy.contains("User:").click();
    cy.url().should("contain", "/login");

    cy.intercept(
      {
        method: "GET",
        url: `${Cypress.env("PATHNAME")}/auth/logout`,
        hostname: Cypress.env("HOSTNAME"),
      },
      (req) => {
        req.reply(200);
      }
    );

    cy.contains("Logout");
  });
  it("finds the User button and visits the login page", () => {
    cy.visit("http://localhost/login");
    cy.contains("Home").click();
    cy.contains("Template app");
  });
});

describe("Check cognito redirect", () => {
  it("finds the login button", () => {
    cy.visit("http://localhost/login");
    cy.origin(cognitoUrl, () => {
      cy.on("uncaught:exception", (e) => {
        if (e.message.includes("Minified React error")) {
          return false;
        }
      });
    });
    cy.contains("Login").click();
    cy.origin(Cypress.env("cognitoUrl"), () => {
      cy.url().then((url) => {
        cy.url().should("equal", Cypress.env("cognitoLoginUrl"));
      });
    });
  });
});
