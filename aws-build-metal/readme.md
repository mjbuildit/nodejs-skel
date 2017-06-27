"Metal Rig" ECS Build Pipeline"
======================================
This set of CloudFormation (Cfn) templates creates an build environment using AWS CodePipeline for Twig
using AWS "metal" tools and techniques.  That is, no software (other than the AWS CLI) is required to
create the environment.

Note that you need a running execution environment in order to successfully create a build environment.

To start your environment:

 1. Install the AWS CLI if you don't already have it.
 1. Create an S3 bucket for the template bundle, in your preferred region (`aws s3 mb s3://<bucket_name> --region <region>`).  I find it helpful to give it the eventual name you'll give the Cfn stack.
 1. Run `./bin/deployTemplates <s3 bucket name>`.  This bundles the templates and places them in the S3 bucket.
 1. Create a Cfn stack referring to the S3 location of the template bundle (the URL is output from the script).  Provide reasonable parameters (most have reasonable defaults).
    1.  There are a few parameters that are slightly tricky, and must be correct.  These allow the code to be deployed properly.
        1. Github repo is the repository name within the Buildit GitHub organziation (e.g. 'twig-api')
        1. Github personal access token
            1. Browse to https://github.com/settings/tokens.
            1. Choose Generate new token.
            1. In Token description, type a description.
            1. Under Select scopes, choose repo.
            1. Choose Generate token.
            1. Copy the generated token to the clipboard.
        1. ECS Cluster ARN: to get the cluster's ARN run `aws ecs list-clusters` at the command-line (this is the simplest/only way, believe it or not).
        1. Target Group ARN:  check the Output section from the Environment Cfn stack you created previously (in the Stack Detail of the AWS Console).
        1. Cfn Template Bucket:  This allows the Cfn template to refer to other Cfn templates in the bundle.  You'll need to enter the S3 bucket name from the prior step here.  Again, I tend to name the bucket and stack the same.

 1. Once the stack completes, you'll have a running CodePipeline.  To see the pipeline in the console, click on the link in the Outputs tab for the main stack.

    Chances are that the pipeline is already running, if you provided the correct parameters.  If it runs to completion, Twig-API should be available at the URL that can be found in the outputs of the execution stack.

