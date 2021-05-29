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

const Listr = require("listr");
const chalk = require("chalk");
const fs = require("fs-extra");

const {
  download,
  downloadDefaultTheme,
  extract,
  isInstalled,
  prepareScripts,
  cleanUpInstallation,
} = require("../../src/helpers");

exports.command = "setup";
exports.desc = "Prepare current directory to install LowCode CMS";
exports.fail = false;
exports.builder = {};

exports.handler = async function (argv) {
  isInstalled();

  const tasks = new Listr([
    {
      title: "Download Installation Files",
      task: () => download(),
    },
    {
      title: "Extract Files",
      task: () => extract("./lowcodecms.zip", process.cwd() + "/.lowcodecms"),
    },
    {
      title: "Download default Theme",
      task: () => downloadDefaultTheme(),
    },
    {
      title: "Extract Theme",
      task: () =>
        extract(
          "./theme.zip",
          process.cwd() + "/.lowcodecms/development-main/actions"
        ),
    },
    {
      title: "Setup Theme",
      task: () =>
        fs.move(
          process.cwd() +
            "/.lowcodecms/development-main/actions/soluneo-themes-main",
          process.cwd() + "/.lowcodecms/development-main/actions/themes",
          { overwrite: true }
        ),
    },
    {
      title: "Pepare startup script",
      task: (ctx, task) => prepareScripts(),
    },
    {
      title: "Cleanup",
      task: (ctx, task) => {
        cleanUpInstallation();
        task.title = "Cleanup (done)";
      },
    },
  ]);
  tasks.run().then(() => {
    console.log(
      chalk.green.bold("You can now start LowCode CMS with sol start command")
    );
  });
};
