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

const execa = require("execa");
const fs = require("fs");
const chalk = require("chalk");

exports.command = "logs [options]";
exports.desc = "Show Logfiles";
exports.fail = false;
exports.builder = {
  follow: { describe: "Tail logfile", alias: 'f' },
};

exports.handler = async function (argv) {
  if (!fs.existsSync(".lowcodecms")) {
    throw chalk.red.bold(
      "LowCode CMS Installation not found. Are you in the right directory?\n"
    );
  }
  const logprocess = execa.command(
    `docker-compose -f .lowcodecms/development-main/docker-compose.yml logs ${
      argv.follow ? "--follow" : ""
    }`
  );
  logprocess.stdout.pipe(process.stdout);

  const { stdout } = await logprocess;
  console.log("child output:", stdout);
};
