import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import {
  Distribution,
  type ErrorResponse,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
  OriginSslPolicy,
  OriginProtocolPolicy,
  OriginRequestPolicy,
  CachePolicy,
  AllowedMethods,
  BehaviorOptions,
} from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin, S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

interface UiDeploymentStackProps extends StackProps {
  domains: string[];
  cloudfrontCertificateArn: string;
  serverDomain: string;
  serverPathPattern: string; // In the format "/api/*"
}

export class UiDeploymentStack extends Stack {
  public readonly uiBucketArn: string;
  public readonly uiDistributionId: string;

  constructor(
    scope: Construct,
    id: string,
    name: string,
    props: UiDeploymentStackProps
  ) {
    super(scope, id, props);

    const deploymentBucket = new Bucket(this, `${name}UiDeploymentBucket`, {
      bucketName: `${name}ui-bucket`,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    new BucketDeployment(this, `${name}Deployment`, {
      destinationBucket: deploymentBucket,
      sources: [],
    });

    const originIdentity = new OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );
    deploymentBucket.grantRead(originIdentity);

    const allRoutesRedirect: ErrorResponse = {
      httpStatus: 404,
      responseHttpStatus: 200,
      responsePagePath: "/index.html",
    };

    const certificate = Certificate.fromCertificateArn(
      this,
      "domainCert",
      props.cloudfrontCertificateArn
    );

    const apiOrigin = new HttpOrigin(props.serverDomain, {
      originSslProtocols: [OriginSslPolicy.SSL_V3],
      protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
      httpsPort: 443,
      customHeaders: {
        "X-Secret-CloudFront": "PLACEHOLDER_VALUE",
      },
    });

    const apiBehaviourOptions: BehaviorOptions = {
      origin: apiOrigin,
      compress: false,
      allowedMethods: AllowedMethods.ALLOW_ALL,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: CachePolicy.CACHING_DISABLED,
      originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
    };

    const distribution = new Distribution(this, `${name}UiDistribution`, {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new S3Origin(deploymentBucket, {
          originAccessIdentity: originIdentity,
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        [props.serverPathPattern]: apiBehaviourOptions,
      },
      errorResponses: [allRoutesRedirect],
      certificate: certificate,
      domainNames: props.domains,
    });

    new CfnOutput(this, `${name}UiUrl`, {
      value: distribution.distributionDomainName,
    });

    this.uiBucketArn = deploymentBucket.bucketArn;
    this.uiDistributionId = distribution.distributionId;
  }
}
