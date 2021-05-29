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
const fetch = require("node-fetch");
const execa = require("execa");

const { login } = require("../../src/helpers");

exports.command = "login";
exports.desc = "Prepare current directory to install LowCode CMS";
exports.fail = false;
exports.builder = {};

exports.handler = async function (argv) {
  const tasks = new Listr([
    {
      title: "Authenticate to LowCode CMS",
      task: (ctx, task) => login(ctx, task),
    },
    {
      title: "Store credentials",
      task: (ctx, task) => {
        if (!ctx.soltoken) {
          task.skip("token not valid");
        }
      },
    },
    {
      title: "Read Developer Settings",
      task: async (ctx, task) => {
        if (!ctx.soltoken) {
          task.skip("token not valid");
        } else {
          const url = "https://my.lowcodecms.com/api/settings";
          const result = await fetch(url, {
            method: "GET",
            withCredentials: true,
            credentials: "include",
            headers: {
              Authorization: "Bearer " + ctx.soltoken,
            },
          });
          const data = await result.json();
          ctx.devsettings = { ...data.settings };
        }
      },
    },
    {
      title: "Docker installed",
      task: (ctx, task) =>
        execa("docker").catch(() => {
          ctx.docker = false;

          task.skip("Docker not available`");
        }),
    },
    {
      title: "Authenticate to Container Registry",
      task: (ctx, task) =>
        execa(
          `echo ${ctx.devsettings.GithubToken} | docker login ghcr.io -u ${ctx.devsettings.GithubUser} --password-stdin`,
          [],
          { shell: true }
        ).catch((e) => {
          console.log(e);
          task.skip("Could not authtenticate to registry`" + JSON.stringify(e));
        }),
    },

    {
      title: "Finishing",
      task: () => setTimeout(() => process.exit(0), 100),
    },
  ]);

  tasks.run().then(() => {
    console.log(
      chalk.green.bold(
        "You can now setup (sol setup) and start (sol start) LowCode CMS"
      )
    );
  });
};
