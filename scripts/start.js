#!/usr/bin/env node

/*
 * Copyright 2023 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

const { argv } = require('yargs');
const { spawn } = require('child_process');

(function start() {
  const flags = process.argv.slice(process.argv.findIndex((arg) => arg.includes('scripts/start')) + 1);
  const nodeArgs = [
    '--dns-result-order', 'ipv4first',
    '--no-experimental-fetch',
  ];

  if (process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || argv.logLevel === 'trace') {
    nodeArgs.push('--require=./lib/server/utils/tracer.js');
  }

  const inspectIndex = flags.findIndex((flag) => flag.startsWith('--inspect'));
  if (inspectIndex !== -1) {
    nodeArgs.push(flags[inspectIndex], '--expose-gc');
    flags.splice(inspectIndex, 1);
  }

  const commandArgs = [
    ...nodeArgs,
    'lib/server/index.js',
    ...flags,
  ];

  console.log(`node ${commandArgs.join(' ')}`);

  const node = spawn('node', commandArgs, {
    stdio: 'inherit',
    killSignal: 'SIGINT',
  });

  [
    'SIGINT',
    'SIGTERM',
    'SIGUSR2',
  ].forEach((signal) => {
    // Forward signals to child process
    // This is required for Docker, but the behavior is automatic when using Node directly
    process.on(signal, () => {
      node.kill(signal);
    });
  });

  process.on('exit', (code) => {
    console.log(`exiting with code: ${code}`);
    node.kill(code);
  });
}());
