import Generator from "yeoman-generator";
import fs from "fs";
import yaml from "js-yaml";

export default class extends Generator {
  async prompting() {
    this.answers = await this.prompt([
      {
        type: "input",
        name: "configFile",
        message:
          "Please enter a config file name, of the form 'file.yml'. This MUST exist and be a complete yaml file in the required format, in the /generator/cognito/ folder, or the generator will fail.",
        default: "config.yml",
      },
    ]);

    this.configData = null;
    const configFilePath = this.templatePath(`../${this.answers.configFile}`);

    function checkProperty(object, property) {
      if (object[property] == undefined) {
        const error = `Property '${property}' does not exist on in the provided config file.`;
        throw new Error(error);
      }
      console.log(`Config property '${property}' checked.`);
    }

    const configPropertiesToCheck = [
      "localDomain",
      "testDomain",
      "sandboxDomain",
      "prodDomain",
      "localApiDomain",
      "testApiDomain",
      "sandboxApiDomain",
      "prodApiDomain",
      "cognitoDomainLocal",
      "cognitoUserPoolClientIdLocal",
      "cognitoDomainTest",
      "cognitoUserPoolClientIdTest",
      "cognitoDomainSandbox",
      "cognitoUserPoolClientIdSandbox",
      "cognitoDomainProd",
      "cognitoUserPoolClientIdProd",
    ];

    if (fs.existsSync(configFilePath)) {
      this.log("Found YAML config file: loading...");
      try {
        const fileContents = fs.readFileSync(configFilePath, "utf8");
        const configData = yaml.load(fileContents);
        configPropertiesToCheck.forEach((property) => {
          checkProperty(configData, property);
        });
        this.answers = configData;
      } catch (error) {
        throw new Error(`Error reading YAML config file. ${error}`);
      }
    } else {
      throw new Error(
        `No YAML config found at ${this.answer.configFile}. Please try again.`
      );
    }
  }

  writing() {
    const toCopy = [
      ".env.development",
      ".env.test",
      ".env.sandbox",
      ".env.production",
      "src/components/layout/NavBar.tsx",
      "src/components/utility/AuthContext.tsx",
      "src/components/utility/LogoutButton.tsx",
      "src/components/utility/UserButton.tsx",
      "src/components/AuthPage.tsx",
      "src/data/auth.ts",
      "src/data/useAuth.ts",
      "src/utility/general.ts",
      "src/App.tsx",
      "cypress/e2e/spec.cy.ts",
    ];

    toCopy.forEach((name) => {
      console.log(`Deleting: ${this.destinationPath(name)}`);
      this.fs.delete(this.destinationPath(name));
    });

    this.fs.commit();

    toCopy.forEach((name) => {
      this.fs.copyTpl(this.templatePath(name), this.destinationPath(name), {
        localApiDomain: this.answers.localApiDomain,
        localCognitoUrl: this.answers.cognitoDomainLocal,
        localCognitoClientId: this.answers.cognitoUserPoolClientIdLocal,
        localDomainLoginUri: encodeURIComponent(
          `http://${this.answers.localDomain}/login`
        ),
        testApiDomain: this.answers.testApiDomain,
        testCognitoUrl: this.answers.cognitoDomainTest,
        testCognitoClientId: this.answers.cognitoUserPoolClientIdTest,
        testDomainLoginUri: encodeURIComponent(
          `http://${this.answers.testDomain}/login`
        ),
        sandboxApiDomain: this.answers.sandboxApiDomain,
        sandboxCognitoUrl: this.answers.cognitoDomainSandbox,
        sandboxCognitoClientId: this.answers.cognitoUserPoolClientIdSandbox,
        sandboxDomainLoginUri: encodeURIComponent(
          `https://${this.answers.sandboxDomain}/login`
        ),
        prodApiDomain: this.answers.prodApiDomain,
        prodCognitoUrl: this.answers.cognitoDomainProd,
        prodCognitoClientId: this.answers.cognitoUserPoolClientIdProd,
        prodDomainLoginUri: encodeURIComponent(
          `https://${this.answers.prodDomain}/login`
        ),
      });
    });
  }

  install() {
    this.spawnSync("git", ["add", "."]);
    this.spawnSync("git", ["commit", "-m", "added cognito scaffolds"]);
    this.spawnSync("git", ["push", "origin", "main"]);
  }
}
