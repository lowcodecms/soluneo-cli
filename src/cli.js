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

import arg from "arg";
import Listr from "listr";
import watch from "node-watch";
import fs from "fs";
import os from "os";
import path from "path";
import util from "util";
import zip from "bestzip";
import ora from "ora";
import fetch from "node-fetch";
import chalk from "chalk";
import FormData from "form-data";
import express from "express";
import open from "open";
import cors from "cors";
import bodyParser from "body-parser";
import { nanoid } from "nanoid";

const extract = require("extract-zip");

const { Observable } = require("rxjs");
const execa = require("execa");

const mkdtemp = util.promisify(fs.mkdtemp);

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      "--login": String,
      "--username": String,
      "--password": String,
      "--server": String,
      "--install": Boolean,
      "-i": "--install",
      "-u": "--username",
      "-p": "--password",
    },

    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    login: args["--login"] || false,
    skipPrompts: args["--yes"] || false,
    git: args["--git"] || false,
    username: args["--username"] || false,
    password: args["--password"]
      ? args["--password"]
      : //.split("")
        // .map((k) => "*")
        // .join("")
        false,
    server: args["--server"] || false,
    template: args._[0],
    runInstall: args["--install"] || false,
  };
}

async function createPackage(options) {
  const spinner = ora("Creating Package").start();
  spinner.color = "yellow";
  try {
    const folder = await mkdtemp(path.join(os.tmpdir(), "sol-"));
    const destination = path.join(folder, "./destination.zip");
    await zip({
      source: ["./components/*", "./package.json"],
      destination,
    });
    spinner.color = "green";
    spinner.text = "Package Created";
    const stream = fs.createReadStream(destination);
    const formData = new FormData();
    formData.append("package", stream, {
      contentType: "application/zip",
      filename: "destination.zip",
    });
    spinner.text = "Uploading Package";
    const headers = {
      Authorization:
        "Basic " +
        Buffer.from(options.username + ":" + options.password).toString(
          "base64"
        ),
    };

    const result = await fetch(options.server + "/api/apps/install", {
      method: "POST",
      body: formData,
      headers,
      redirect: "follow",
      withCredentials: true,
      credentials: "include",
    });
    spinner.stop();
    if (result.status !== 200) {
      console.log(
        chalk.red.bold(
          "Error installing package: " + result.statusText + result.status
        )
      );
      const error = await result.text();
      console.log(error);
    } else {
      console.log(chalk.green.bold("Package installed"));
    }
  } catch (e) {
    console.log(chalk.red.bold("Package installation error"));
    console.log(e);
  }
  spinner.stop();
}

function watchCode(options) {
  watch("./", { recursive: true }, function (evt, name) {
    console.log("%s changed.", name);
    createPackage(options);
  });
}

let soltoken = null;

function login() {
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());

  return new Observable(async (observer) => {
    const p = new Promise((resolve, reject) => {
      app.post("/ok", async function (req, res) {
        if (!req.body.token) {
          reject(new Error("no token returned"));
        } else {
          resolve(req.body.token);
        }
        res.end("");
      });
    });

    observer.next("Connecting OAuth Server");
    const server = await app.listen(2710);
    observer.next("Server connected");

    await open("https://beta.soluneo.com/login?cli");
    observer.next("Login Screen");

    p.then((token) => {
      observer.next(token);
      soltoken = token;
      server.close();
      observer.complete();
    }).catch((e) => {
      server.close();
      observer.complete();
    });
  });
}

async function download() {
  const res = await fetch(
    "https://github.com/lowcodecms/development/archive/main.zip"
  );
  await new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream("./lowcodecms.zip");
    res.body.pipe(fileStream);
    res.body.on("error", (err) => {
      reject(err);
    });
    fileStream.on("finish", function () {
      resolve();
    });
  });
}

async function prepareScripts() {
  const dockerComposePath =
    process.cwd() + "/lowcodecms/development-main/docker-compose.yml";
  const rand = nanoid(4);
  const dockerComposeFile = fs.readFileSync(dockerComposePath, "utf8");
  fs.writeFileSync(
    dockerComposePath,
    dockerComposeFile.replace(/\$rand/g, rand),
    "utf8"
  );
}

async function showLogs() {
  try {
    await execa
      .command(
        "docker-compose -f ./lowcodecms/development-main/docker-compose.yml logs"
      )
      .stdout.pipe(process.stdout);
  } catch (error) {
    throw error;
  }
}

export function cli(args) {
  if (args.indexOf("logs") !== -1) {
    showLogs().catch((e) => {
      console.log(e);
    });
    return;
  }

  if (args.indexOf("stop") !== -1) {
    const tasks = new Listr([
      {
        title: "Stopping development server",
        task: (ctx, task) =>
          execa(`cd ./lowcodecms/development-main && docker-compose down`, [], {
            shell: true,
          }).catch((e) => {
            console.log(e);
            task.skip("Could not stop developmentserver");
          }),
      },
    ]);
    tasks.run();

    return;
  }

// lowcodecms/development-main
if (args.indexOf("update") !== -1) {
  const tasks = new Listr([
    {
      title: "Download Installation Files",
      task: () => download(),
    },
    {
      title: "Extract Files",
      task: () => {
        return extract("./lowcodecms.zip", {
          dir: process.cwd() + "/lowcodecms",
        });
      },
    },
    {
      title: "Update startup script",
      task: (ctx, task) => prepareScripts(),
    },
    {
      title: "Pull Latest Development Container",
      task: (ctx, task) =>
        execa(
          `cd ./lowcodecms/development-main && docker-compose pull`,
          [],
          { shell: true }
        ).catch((e) => {
          console.log(e);
          task.skip("Could not start developmentserver");
        }),
    },    
    {
      title: "Free up local space",
      task: (ctx, task) =>
        execa(
          `cd ./lowcodecms/development-main && docker-compose image prune -f`,
          [],
          { shell: true }
        ).catch((e) => {
          console.log(e);
          task.skip("Could not remove unused containers");
        }),
    },    
    {
      title: "Cleanup",
      task: (ctx, task) => fs.unlinkSync("./lowcodecms.zip"),
    },
  ]);
  tasks.run();

  return;
}


  // lowcodecms/development-main
  if (args.indexOf("start") !== -1) {
    const tasks = new Listr([
      {
        title: "Starting development server",
        task: (ctx, task) =>
          execa(
            `cd ./lowcodecms/development-main && docker-compose up -d --remove-orphans`,
            [],
            { shell: true }
          ).catch((e) => {
            console.log(e);
            task.skip("Could not start developmentserver");
          }),
      },
      {
        title:
          "Opening Browser on http://localhost/console/sites (superuser / super2020)",
        task: () => open("http://localhost/console/sites"),
      },
    ]);
    tasks.run();

    return;
  }

  if (args.indexOf("install") !== -1) {
    const tasks = new Listr([
      {
        title: "Download Installation Files",
        task: () => download(),
      },
      {
        title: "Extract Files",
        task: () => {
          return extract("./lowcodecms.zip", {
            dir: process.cwd() + "/lowcodecms",
          });
        },
      },
      {
        title: "Pepare startup script",
        task: (ctx, task) => prepareScripts(),
      },
      {
        title: "Cleanup",
        task: (ctx, task) => fs.unlinkSync("./lowcodecms.zip"),
      },
    ]);
    tasks.run();

    return;
  }
  if (args.indexOf("login") !== -1) {
    const tasks = new Listr([
      {
        title: "Authenticate to LowCode CMS",
        task: () => login(),
      },
      {
        title: "Store credentials",
        task: (ctx, task) => {
          if (!soltoken) {
            task.skip("token not valid");
          }
        },
      },
      {
        title: "Read Developer Settings",
        task: async (ctx, task) => {
          if (!soltoken) {
            task.skip("token not valid");
          } else {
            const url = "https://my.lowcodecms.com/api/settings";
            const result = await fetch(url, {
              method: "GET",
              withCredentials: true,
              credentials: "include",
              headers: {
                Authorization: "Bearer " + soltoken,
              },
            });
            const data = await result.json();
            ctx.devsettings = { ...data.settings };
          }
        },
      },
      {
        title: "Docker inkstalled?",
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
            task.skip(
              "Could not authtenticate to registry`" + JSON.stringify(e)
            );
          }),
      },

      {
        title: "finishing",
        task: () => setTimeout(() => process.exit(0), 100),
      },
    ]);

    tasks.run();
  } else {
    let options = parseArgumentsIntoOptions(args);
    const tasks = new Listr([
      {
        title: "Watch files",
        task: () => watchCode(options),
      },
    ]);
    tasks.run();
  }
}
