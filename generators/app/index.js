import Generator from "yeoman-generator";
import fs from "fs";
import { execSync } from "child_process";
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
      "projectName",
      "githubUser",
      "testApiDomain",
      "localApiDomain",
      "sandboxApiDomain",
      "prodApiDomain",
      "sandboxDomain",
      "prodDomain",
      "certificateArn",
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

    this.props = {
      ...this.answers,
      appPath: this.destinationPath(
        `${this.answers.projectName}/${this.answers.projectName}-client`
      ),
      pipelinePath: this.destinationPath(
        `${this.answers.projectName}/${this.answers.projectName}-pipeline-client`
      ),
    };
  }

  writing() {
    const projectName = this.answers.projectName;
    this.destinationRoot(this.props.appPath);

    const toCopy = [
      ".eslintrc",
      ".env.development",
      ".env.test",
      ".env.sandbox",
      ".env.production",
      "index.html",
      "buildspec.yml",
      "postcss.config.js",
      "tailwind.config.js",
      "tsconfig.json",
      "tsconfig.node.json",
      ".gitignore",
      "vite.config.ts",
      "cypress.config.ts",
    ];

    toCopy.forEach((name) => {
      this.fs.copyTpl(
        this.templatePath(`client/${name}`),
        this.destinationPath(name),
        {
          localApiDomain: this.answers.localApiDomain,
          testApiDomain: this.answers.testApiDomain,
          sandboxApiDomain: this.answers.sandboxApiDomain,
          prodApiDomain: this.answers.prodApiDomain,
          sandboxDomain: this.answers.sandboxDomain,
          prodDomain: this.answers.prodDomain,
        }
      );
    });

    this.fs.copy(this.templatePath("client/src"), this.destinationPath("src"));
    this.fs.copy(
      this.templatePath("client/scripts"),
      this.destinationPath("scripts")
    );
    this.fs.copy(
      this.templatePath("client/cypress"),
      this.destinationPath("cypress")
    );

    const pkgJson = {
      name: "client",
      private: true,
      version: "0.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        "vite:e2e": "vite --mode test",
        build: "tsc && vite build",
        lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
        preview: "vite preview",
        "cy:open": "cypress open",
        "cy:run-dev": "VITE_MODE=development cypress run",
        "cy:run-test": "VITE_MODE=test cypress run",
        "test:e2e":
          "start-server-and-test vite:e2e http://localhost cy:run-test",
        "run:e2e": "start-server-and-test dev http://localhost cy:run-dev",
        "watch:test": "onchange 'src/**/*.{ts,tsx,js,jsx}' -- npm run cy:run",
        "dev:test": 'concurrently "bun run dev" "bun run watch:test"',
      },
      dependencies: {
        "@tanstack/react-query": "^5.40.0",
        flatted: "^3.3.1",
        "json-parse-even-better-errors": "^3.0.2",
        react: "^18.2.0",
        "react-cookie": "^7.1.4",
        "react-dom": "^18.2.0",
        "react-helmet-async": "^2.0.5",
        "react-markdown": "^9.0.1",
        "react-router-dom": "^6.23.1",
      },
      devDependencies: {
        "@types/react": "^18.2.66",
        "@types/react-dom": "^18.2.22",
        "@typescript-eslint/eslint-plugin": "^7.2.0",
        "@typescript-eslint/parser": "^7.2.0",
        "@vitejs/plugin-react": "^4.2.1",
        autoprefixer: "^10.4.19",
        concurrently: "^9.1.2",
        cypress: "^13.17.0",
        daisyui: "latest",
        dotenv: "^16.4.7",
        eslint: "^8.57.0",
        "eslint-config-react-app": "^7.0.1",
        "eslint-plugin-react-hooks": "^4.6.0",
        "eslint-plugin-react-refresh": "^0.4.6",
        onchange: "^7.1.0",
        parseuri: "^3.0.2",
        postcss: "^8.4.38",
        "start-server-and-test": "^2.0.9",
        tailwindcss: "^3.4.3",
        typescript: "^5.2.2",
        vite: "^5.2.0",
      },
    };

    fs.writeFileSync(
      this.destinationPath("package.json"),
      JSON.stringify(pkgJson, null, 2)
    );

    // this.destinationRoot(this.destinationPath(`../${pipelinePath}`));
    this.destinationRoot(this.props.pipelinePath);

    this.fs.copyTpl(this.templatePath("cdk-pipeline"), this.destinationPath(), {
      projectName: this.answers.projectName,
      githubUser: this.answers.githubUser,
      appRepo: this.answers.appRepo,
      sandboxDomain: this.answers.sandboxDomain,
      prodDomain: this.answers.prodDomain,
      certificateArn: this.answers.certificateArn,
    });
  }

  install() {
    this.destinationRoot(this.props.pipelinePath);

    try {
      execSync("bun --version", { stdio: "ignore" });
      this.log("Bun is already installed");
    } catch (error) {
      this.log("Bun is not installed, installing...");
      try {
        execSync("curl -fsSL https://bun.sh/install | bash", {
          stdio: "inherit",
        });
        this.log("Bun installed successfully");
      } catch {
        this.log("Bun failed to install. Please install manually.");
        return;
      }
    }

    try {
      execSync("cdk --version", { stdio: "ignore" });
      this.log("CDK is already installed");
    } catch (error) {
      try {
        execSync("bun a -g aws-cdk", { stdio: "ignore" });
      } catch (error) {
        this.log("Failed. CDK could not be installed");
      }
      this.log("CDK is not installed, installing...");
    }

    // the generator is still in the pipeline folder at this point, but the files have been written, so doing bun install works

    this.spawnSync("npm", ["install"]);

    // this.destinationRoot(this.destinationPath(`../${appPath}`));
    this.destinationRoot(this.props.appPath);

    this.spawnSync("bun", ["install"]);
    this.spawnSync("git", ["init"]);
    this.spawnSync("git", ["add", "."]);
    this.spawnSync("git", ["commit", "-m", "'first commit'"]);
    this.spawnSync("gh", [
      "repo",
      "create",
      this.answers.appRepo,
      "--private",
      "--source=.",
      "--push",
    ]);

    // Remember to go back to the pipeline directory before doing cdk actions!
    // this.destinationRoot(this.destinationPath(`../${pipelinePath}`));
    this.destinationRoot(this.props.pipelinePath);
    this.spawnSync("cdk", ["deploy", "--all"]);
  }
}
