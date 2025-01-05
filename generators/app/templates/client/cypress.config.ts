import { defineConfig } from "cypress";
import dotenv from "dotenv";
import { parseUri } from "parseuri";

const mode = process.env.VITE_MODE || "test";
dotenv.config({ path: `.env.${mode}` });

console.log(`Data URL: ${process.env.VITE_DATA_URL}`);
const { hostname, pathname } = parseUri(process.env.VITE_DATA_URL);
console.log(`Hostname: ${hostname}\nPathname: ${pathname}`);

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      HOSTNAME: hostname,
      PATHNAME: pathname,
      VITE_COGNITO_URL: process.env.VITE_COGNITO_URL,
      VITE_COGNITO_CLIENT_ID: process.env.VITE_COGNITO_CLIENT_ID,
      VITE_COGNITO_REDIRECT_URI: process.env.VITE_COGNITO_REDIRECT_URI,
    },
  },
});
