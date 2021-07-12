@Library('geomart@master') _
pipeline {
  agent any
  options {
        disableConcurrentBuilds()
    }
    
  environment 
    {
      REGION = 'us-west-2'       
    }

  stages {
    stage('Clone') {
      steps {
        firstStage()
      } 
    }

    stage('Setup Environment variables') {
      steps {
        script {
          echo "Branch: $env.BRANCH_NAME"
          // echo "Build Target: $env.target"
          //env.SQS_QUEUE = 'psps_eppackage'

          //Checking if the branch is feature
          if (env.BRANCH_NAME.startsWith("feature_")) {    
            env.STACK_PREFIX = 'psps-eppackageapi' 
            env.SQS_QUEUE = 'psps_eppackage'
            env.AUTHORIZER = 'auth-Apr-A2324-Non-Prod-PSPS_WebApp'
            env.LAMBDALAYER= 'nodejs-package:5'
            env.LAMARN = 'arn:aws:lambda:us-west-2:241689241215:function:pge-authorizer-Apr-A2324-Non-Prod-PSPS_WebApp'
            }
          else if (env.BRANCH_NAME.startsWith("hotfix")) {    
            env.STACK_PREFIX = 'psps-eppackageapi' 
            env.AUTHORIZER = 'auth-Apr-A2324-Non-Prod-PSPS_WebApp'
            env.SQS_QUEUE = 'psps_eppackage'
            env.LAMBDALAYER= 'nodejs-package:5'
            env.LAMARN = 'arn:aws:lambda:us-west-2:241689241215:function:pge-authorizer-Apr-A2324-Non-Prod-PSPS_WebApp'
            }
          //Checking if the branch is Master
          else if (env.BRANCH_NAME == 'master') {
            env.STACK_PREFIX = 'psps-eppackageapi'
            env.SQS_QUEUE = 'psps_eppackage'
            env.AUTHORIZER = 'auth-Apr-1837-Prod-PSPS_Webapp'
            env.LAMBDALAYER= 'nodejs-package:1'
            env.LAMARN = 'arn:aws:lambda:us-west-2:686137062481:function:pge-authorizer-Apr-1837-Prod-PSPS_Webapp'
            }
          //Checking if the branch is QA
          else if (env.BRANCH_NAME.startsWith("release")) {
            env.STACK_PREFIX = 'psps-eppackageapi'
            env.SQS_QUEUE = 'psps_eppackage'
            env.AUTHORIZER = 'auth-Apr-A2324-Non-Prod-PSPS_WebApp'
            env.LAMBDALAYER= 'nodejs-package:1'
            env.LAMARN = 'arn:aws:lambda:us-west-2:241689241215:function:pge-authorizer-Apr-A2324-Non-Prod-PSPS_WebApp'
            }

        }
      }
    }

	  stage('Install node dependencies of the web app') {
      environment {
          COMMAND = """ \
              cd createjob; npm install; cd .. &&
              cd jobstatus; npm install;
          """
         }
	    steps {
          cliDockerRun(COMMAND)
	      }
	    }	
   
    stage('Lint') {
      environment {
          COMMAND = """ \
              cd createjob; npm run lint; cd .. &&
              cd jobstatus; npm run lint;
          """
         }
	    steps {
          cliDockerRun(COMMAND)
	    }
    }

    // stage('Unit Tests') {
    //   steps {
    //     script {
    //       sh "aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin $ECR"
    //       docker.image(ECR + "/geomart-cli").inside("-u root") {
    //       sh 'cd createjob;NODE_ENV=${VARIABLE} npm run test;'
	  //       }
	  //     }
    //   }
    // }
   
    stage('Schema Updates') {
        steps {
            updateSchema()
        }    
    }    

	  stage('Create Infrastructure') {
        steps {
            script {
                param = """ \
                  account=$AWS_ACCOUNT \
                  pauthorizername=$AUTHORIZER \
                  plambdaarn=$LAMARN \
                  plambdalayer=$LAMBDALAYER \
                """
                cloudformation(param, "jenkinstack-geomartcloud-${STACK_PREFIX}", "ci/cfn/cloudformation-api.yml", true)
            }
        }
    }
    
    stage('Zip/Deploy the code') { 
          steps {
              zipLambda("createjob","*node_modules*") 
              zipLambda("jobstatus","*node_modules*") 

              deployLambda("createjob", "psps_createjob_eppackage")
              deployLambda("jobstatus", "psps_jobstatus_eppackage")
          }
      }
    


    // stage('Upload artifacts to S3 Bucket') {
    //   steps {
    //         script {
    //          if (env.DEPLOY == 'true') {
    //            echo "AWS Account: $AWS_ACCOUNT"
    //            echo 'Validating Result'
    //            sh '''chmod -R 777 * && zip -r build-${BUILD_NUMBER}.zip GetCircuits ValidateCircuits_V2 
    //            aws s3 cp build-${BUILD_NUMBER}.zip s3://psps-geomartcloud-dev/artifacts/API/buildartifacts/
    //           '''
    //           }
    //         }
    //     }
    // }
  }
	post {
    always {
        postStage()
      }
  }	  
}

// END PIPELINE
