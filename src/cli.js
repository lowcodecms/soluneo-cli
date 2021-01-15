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
import FormData from 'form-data';

const mkdtemp = util.promisify(fs.mkdtemp);

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
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
    skipPrompts: args["--yes"] || false,
    git: args["--git"] || false,
    username: args["--username"] || false,
    password: args["--password"]
      ? args["--password"]
          //.split("")
         // .map((k) => "*")
         // .join("")
      : false,
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
    formData.append('package', stream, {
        contentType: 'application/zip',
        filename: "destination.zip",
      });
    spinner.text = "Uploading Package";
    const headers = {
        Authorization : 'Basic ' + Buffer.from(options.username + ":" + options.password).toString('base64')
    };
    
    const result = await fetch(options.server + "/api/apps/install", {
      method: "POST",
      body: formData,
      headers,
      redirect: 'follow',
      withCredentials: true,
        credentials: 'include',
    });
    spinner.stop();
    if (result.status !== 200) {
      console.log(
        chalk.red.bold("Error installing package: " + result.statusText + result.status)
      );
      const error = await result.text();
      console.log(error)
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

export function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  const tasks = new Listr([
    {
      title: "Watch files",
      task: () => watchCode(options),
    }
  ]);
  tasks.run();
}
