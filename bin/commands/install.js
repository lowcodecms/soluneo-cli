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

const watch = require("node-watch");
const ora = require("ora");

const { createAndUploadPackage } = require("../../src/helpers");

exports.command = "install [options]";
exports.desc = "Install local app project on LowCode CMS Server";
exports.fail = false;
exports.demandCommand = 0;
exports.builder = {
  server: {
    describe: "Destination Server",
    alias: "s",
    default: "http://localhost",
  },
  username: { describe: "username", alias: "u", default: "superuser" },
  password: { describe: "password", alias: "p", default: "super2020" },
  watch: { describe: "Watch for local changes and install", alias: "w" },
};

exports.handler = async function (argv) {
  await createAndUploadPackage(argv);
  if (argv.watch) {
    const spinner = ora("Watching for file changes").start();
    spinner.color = "green";
    watch(
      "./",
      {
        recursive: true,
        filter(f, skip) {
          // skip node_modules
          if (/\.lowcodecms/.test(f)) return skip;
          // skip node_modules
          if (/\/node_modules/.test(f)) return skip;
          // skip .git folder
          if (/\.git/.test(f)) return skip;
          // only watch for js files
          return (
            /\.js$/.test(f) ||
            /\.hbs$/.test(f) ||
            /\.md$/.test(f) ||
            /\.scss$/.test(f) ||
            /package.json$/.test(f) ||
            /dialog.json$/.test(f)
          );
        },
      },
      async function (evt, name) {
        spinner.color = "yellow";
        spinner.text = `${name} changed.`;
        await createAndUploadPackage(argv);
        spinner.color = "green";
        spinner.text = "Waiting for changes.";
      }
    );
  }
};
