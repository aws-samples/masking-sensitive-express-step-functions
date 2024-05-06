import { awscdk } from 'projen';

const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.139.0',
  defaultReleaseBranch: 'main',
  name: 'logging-and-masking-express-step-functions',
  projenrcTs: true,

  autoMerge: false,
  npmignoreEnabled: false,

  license: 'MIT-0',
  copyrightOwner: 'Amazon.com, Inc. or its affiliates. All Rights Reserved.',
  copyrightPeriod: '',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});

project.addTask('invoke-state-machine', {
  exec: 'bash scripts/invoke-state-machine.sh',
});

project.synth();
