/*****************************************************************************
 * Copyright (c) 2019-2021 SOLUTAS LLC, Switzerland. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use
 * this file except in compliance with the License. You may obtain a copy of the
 * License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
 * WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
 * MERCHANTABLITY OR NON-INFRINGEMENT.
 *
 * See the Apache Version 2.0 License for specific language governing permissions
 * and limitations under the License.
 ******************************************************************************/

const Stream = require("stream");
const ora = require("ora");
const execa = require("execa");
const chalk = require("chalk");

exports.command = "stop";
exports.desc = "Stop LowCode CMS";
exports.fail = false;
exports.builder = {};

exports.handler = function (argv) {
  const spinner = ora("Stopping LowCode CMS\n").start();
  spinner.prefixText = "Shutdown: ";
  const ls = execa("docker-compose", [
    "-f",
    ".lowcodecms/development-main/docker-compose.yml",
    "down",
  ]);

  ls.then(() => {
    try {
      spinner.succeed(chalk.green.bold(`LowCode CMS stopped`));

      process.exit();
    } catch (e) {}
  }).catch((error) => {
    spinner.fail(chalk.red.bold(error));
    process.exit(1);
  });
  const writableStream = new Stream.Writable();
  writableStream._write = (chunk, encoding, next) => {
    spinner.text = chunk.toString();

    next();
  };
  ls.stdout.pipe(writableStream);
  ls.stderr.pipe(writableStream);
};
