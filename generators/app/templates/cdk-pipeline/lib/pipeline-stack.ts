import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Bucket, BucketAccessControl } from "aws-cdk-lib/aws-s3";
import {
  SecretValue,
  aws_codepipeline,
  aws_codepipeline_actions,
  Duration,
} from "aws-cdk-lib";
import {
  CodeBuildAction,
  S3DeployAction,
  ManualApprovalAction,
  LambdaInvokeAction,
} from "aws-cdk-lib/aws-codepipeline-actions";
import {
  ComputeType,
  LinuxBuildImage,
  PipelineProject,
} from "aws-cdk-lib/aws-codebuild";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { PipelineType } from "aws-cdk-lib/aws-codepipeline";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { join } from "path";

export interface PipelineStackProps extends cdk.StackProps {
  frontEndBucketArnSandbox: string;
  frontEndDistributionIdSandbox: string;
  frontEndBucketArnProd: string;
  frontEndDistributionIdProd: string;
  repo: string;
}

export class PipelineStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    name: string,
    props: PipelineStackProps
  ) {
    super(scope, id, props);

    const bucket = new Bucket(this, `${name}DeployBucket`, {
      accessControl: BucketAccessControl.PRIVATE,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const fullSource = new aws_codepipeline.Artifact();
    const clientArtifactSandbox = new aws_codepipeline.Artifact(
      "client-sandbox"
    );
    const clientArtifactProd = new aws_codepipeline.Artifact("client-prod");

    const invalidationLambda = new NodejsFunction(this, "InvalidationLambda", {
      runtime: Runtime.NODEJS_LATEST,
      handler: "handler",
      entry: join(__dirname, "lambdas", "invalidationHandler.js"),
      environment: {},
      timeout: Duration.seconds(10),
    });

    invalidationLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: ["*"],
        actions: ["cloudfront:CreateInvalidation"],
      })
    );

    const sourceAction = new aws_codepipeline_actions.GitHubSourceAction({
      actionName: "GitHub_Source",
      owner: "<%=githubUser%>",
      repo: props.repo,
      oauthToken: SecretValue.secretsManager("github-token", {
        jsonField: "token",
      }),
      output: fullSource,
      branch: "main",
    });

    const buildProjectSandbox = new PipelineProject(
      this,
      `${name}BuildSandbox`,
      {
        environment: {
          buildImage: LinuxBuildImage.AMAZON_LINUX_2_5,
          computeType: ComputeType.SMALL,
        },
        environmentVariables: {
          NODE_ENV: { value: "sandbox" },
        },
      }
    );
    const buildActionSandbox = new CodeBuildAction({
      actionName: "clientBuildActionSandbox",
      input: fullSource,
      project: buildProjectSandbox,
      outputs: [clientArtifactSandbox],
    });

    const buildProjectProd = new PipelineProject(this, `${name}BuildProd`, {
      environment: {
        buildImage: LinuxBuildImage.AMAZON_LINUX_2_5,
        computeType: ComputeType.SMALL,
      },
      environmentVariables: {
        NODE_ENV: { value: "production" },
      },
    });
    const buildActionProd = new CodeBuildAction({
      actionName: "clientBuildActionProd",
      input: fullSource,
      project: buildProjectProd,
      outputs: [clientArtifactProd],
    });

    const clientDeploySandbox = new S3DeployAction({
      actionName: "deployFrontEndSandbox",
      bucket: Bucket.fromBucketArn(
        this,
        `${name}FrontEndBucketTest`,
        props.frontEndBucketArnSandbox
      ),
      input: clientArtifactSandbox,
      extract: true,
      runOrder: 1,
    });

    const clientDeployProd = new S3DeployAction({
      actionName: "deployFrontEndProd",
      bucket: Bucket.fromBucketArn(
        this,
        `${name}FrontEndBucketProd`,
        props.frontEndBucketArnProd
      ),
      input: clientArtifactProd,
      extract: true,
      runOrder: 1,
    });

    const clientLambdaInvalidationSandbox = new LambdaInvokeAction({
      lambda: invalidationLambda,
      actionName: "InvalidationTestLambdaAction",
      userParameters: {
        distributionId: props.frontEndDistributionIdSandbox,
        items: ["/*"],
      },
      runOrder: 2,
    });

    const clientLambdaInvalidationProd = new LambdaInvokeAction({
      lambda: invalidationLambda,
      actionName: "InvalidationTestLambdaAction",
      userParameters: {
        distributionId: props.frontEndDistributionIdProd,
        items: ["/*"],
      },
      runOrder: 2,
    });

    const prodManualApproval = new ManualApprovalAction({
      actionName: "approveToProd",
    });

    new aws_codepipeline.Pipeline(this, `${name}Pipeline`, {
      pipelineName: `${name}-pipeline`,
      pipelineType: PipelineType.V2,
      stages: [
        {
          stageName: "github",
          actions: [sourceAction],
        },
        {
          stageName: "build-sandox",
          actions: [buildActionSandbox],
        },
        {
          stageName: "deploy-sandbox",
          actions: [clientDeploySandbox, clientLambdaInvalidationSandbox],
        },
        {
          stageName: "approve-to-prod",
          actions: [prodManualApproval],
        },
        {
          stageName: "build-prod",
          actions: [buildActionProd],
        },
        {
          stageName: "deploy-prod",
          actions: [clientDeployProd, clientLambdaInvalidationProd],
        },
      ],
      artifactBucket: bucket,
    });
  }
}
