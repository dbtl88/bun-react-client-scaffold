import * as cdk from "aws-cdk-lib";
import { PipelineStack } from "../lib/pipeline-stack";
import { UiDeploymentStack } from "../lib/ui-stack";

const name = "<%=projectName%>-client";
const app = new cdk.App();
const uiStackSandbox = new UiDeploymentStack(
  app,
  `${name}-ui-stack-sandbox`,
  `${name}-sandbox`,
  {
    domains: ["<%=sandboxDomain%>"],
    cloudfrontCertificateArn: "<%=certificateArn%>",
    serverDomain: "<%=sandboxApiForCloudFront%>",
    serverPathPattern: "/api*",
  }
);
const uiStackProd = new UiDeploymentStack(
  app,
  `${name}-ui-stack-prod`,
  `${name}-prod`,
  {
    domains: ["<%=prodDomain%>"],
    cloudfrontCertificateArn: "<%=certificateArn%>",
    serverDomain: "<%prodApiForCloudFront%>",
    serverPathPattern: "/api*",
  }
);
new PipelineStack(app, `${name}pipeline-stack`, name, {
  frontEndBucketArnSandbox: uiStackSandbox.uiBucketArn,
  frontEndDistributionIdSandbox: uiStackSandbox.uiDistributionId,
  frontEndBucketArnProd: uiStackProd.uiBucketArn,
  frontEndDistributionIdProd: uiStackProd.uiDistributionId,
  repo: "<%=appRepo%>",
});
