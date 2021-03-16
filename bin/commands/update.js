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
const Listr = require("Listr");
const execa = require("execa");
const chalk = require("chalk");

const {
  download,
  extract,
  isInstalled,
  prepareScripts,
  cleanUpInstallation,
} = require("../../src/helpers");

exports.command = "update";
exports.desc = "update local installation to latest Cloud version.";
exports.fail = false;
exports.builder = {};

exports.handler = async function (argv) {
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
      title: "Pepare startup script",
      task: (ctx, task) => prepareScripts(),
    },
    {
      title: "Pull Latest Development Container",
      task: (ctx, task) => {
        return new Promise(async (resolve, reject) => {
          try {
            const childprocess = execa(
              `cd .lowcodecms/development-main && docker-compose pull`,
              [],
              {
                shell: true,
              }
            );

            childprocess
              .then(() => {
                resolve();
              })
              .catch((error) => {
                reject(error);
              });
            const writableStream = new Stream.Writable();
            writableStream._write = (chunk, encoding, next) => {
              task.output = chunk.toString();
              next();
            };
            childprocess.stdout.pipe(writableStream);
            childprocess.stderr.pipe(writableStream);
          } catch (e) {
            reject(e);
            task.skip("Could not start developmentserver");
          }
        });
      },
    },
    {
      title: "Free up local space",
      task: (ctx, task) =>
        execa(`cd .lowcodecms/development-main && docker image prune -f`, [], {
          shell: true,
        }).catch((e) => {
          console.log(e);
          task.skip("Could not remove unused containers");
        }),
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
