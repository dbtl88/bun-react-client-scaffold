# Bun-React-CDK client app scaffold, including AWS Cognito scaffolding

## What is this project?

This is a tool I needed for my personal development needs. It's really hard to go from an empty directory to a fully functioning app that consists of a server and a client and has a build and deployment pipeline, and is actually deployed somewhere, and won't cost crazy money to run as a hobby project for ages if needed, and has sensible authentication baked in, and has a custom domain set up, etc. etc.

This is my attempt to create a tool to scaffold this setup - to get me to the point where I can start writing meaningful code - that matches some of my very eclectic preferences for which frameworks and runtimes and cloud platforms and deployment approaches and auth strategy I want to use. I make no guarantees that any of these are sensible, or suggestions that you should follow them too, or that they're perfectly implemented (or even well implemented), so use any of this with great caution.

This is the client generator, and there is a complementary server generator called bun-elysia-server-scaffold. Here's what the client generator does:

- Copies code for, then deploys, an AWS CDK app that has (1) a CodePipeline to build and deploy the client app to two environments, 'sandbox' and 'production', with a manual approval step between them; (2) a CloudFront distribution, with a custom domain, and an S3 origin (the bucket also gets created), into which the client app artifacts are placed.
- Copies code for the client, which is based on React and built using Vite.
- As part of this, there will be code for basic Cypress end-to-end testing, which you'll want to build out as you build your app around the scaffold.
- When you run the 'cognito' sub-generator, with suitable config, it will scaffold auth related client features. The approach here is to use the Cognito hosted UI to obtain an OAuth2 code grant, then to pass the code back to the server, which retrieves tokens and sends these back to the client ONLY as secure (non-local environments only) http-only cookies. This is to ensure the cookies cannot be accessed by any javascript running on the client host device. These are passed back to the server for all subsequent API requests, and the server handles token refresh using the client-provided refresh token whenever there is less than 5 minutes' validity remaining on the access token.
- Creates a new github repo for your generated client template app (not the CDK app, or anything else), and commits an initial version of this. This is why you need GitHub cli.

I provide no guarantees for this project. It's just supposed to be a demonstration that you can adapt to your own needs.

## Outstanding to-dos

- Make Cypress tests run in CodePipeline
- Improve idempotency and checks for correct starting folder when using 'cognito' sub-generator
- Lots of little niggles.

## Prerequisites

1. To have set up a server app, either using my complementary generator project, or your own approach.
2. Ensure CDK is installed, authenticated, and bootstrapped on your local machine. You can find instructions direct from Amazon.
3. Ensure github cli is installed authenticated on your local machine. You can find instructions direct from GitHub.
4. You must have a github token, with appropriate fine grained permissions, stored in AWS SecretManager, under the name "github-token", of type "Key/Value Pair", with the key "token" corresponding to the token value (which should look like 'gh_randomstring').
5. Populate your config file. You'll need to provide server API URLs, but you can leave these blank and fill them in later if needed. Gitignore will ignore and not commit config-actual.yml, so perhaps use this as your config file name.
6. If you are going to use the 'cognito' generator, you will need to have an existing AWS Cognito User Pool set up, with a User Pool Client set up. The User Pool Client MUST have redirect and logout URIs set up, pointing to 'sandboxDomain/login' and 'prodDomain/login' for both redirect and logout. You can of course modify this app appropriately (and if you used the corresponding server generator, that too) to use your own URI routes.
7. To have node package manager (npm) installed on your local machine.

## Steps for app creation

1. Make sure that DNS records DO NOT EXIST for the sandbox and prod domains you provided in your config.
2. Copy this repo somewhere. Then enter the main source folder, and type `npm install`, then once this is done, `npm link`.
3. Navigate to another folder, where you want to scaffold your app. Run `yo bun-react-client`. You will need to provide the filename of the config file you prepared. Note that the generator will create a folder 'appname' per your provided app name in the your config file, and sub-folders 'appname-client' and 'appname-pipeline-client', so you don't need to create an app folder first, you should start from the desired parent folder.
4. To add cognito (including user table on database) cognito, run `yo bun-react-client:cognito` _from the generated 'appname-client' directory_. DO NOT run it from any of the parent directories.
5. Once the main generator has run, you will be provided, as part of the console output, with the cloudfront distribution URLs for your sandbox and prod clients. Before you can use the custom domains you provided, you will need to create corresponding CNAME records. NOTE: If you are using a service like Cloudflare, this will not work out of the box if you proxy the requests - you're on your own for this. If you just have plain DNS-only records setup, this will work out of the box. Note also that CloudFront WAF is not set up on these distributions, you'll need to do this yourself.

## Commands to run the app

1. To run locally, use `bun dev`
2. To run tests, use `bun test:e2e`
3. To run eslint, use `bun lint`
4. Other commands, including to watch the source and re-run tests on changes, are provided in the scripts section of package.json

## Steps for app removal and cleanup

1. Go into appname/appname-pipeline-server and run `cdk destroy --force`
2. Go back to top level and `rm -rf appname-client` to remove the main appname-server folder
3. Hard delete the github repo via GitHub CLI: `gh repo delete repo-name --yes`
4. Remove your DNS CNAME records from your
