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

const fs = require("fs");
const extract = require("extract-zip");
const chalk = require("chalk");
const nanoid = require("nanoid").nanoid;
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const Observable = require("rxjs").Observable;
const open = require("open");
const fetch = require("node-fetch");
const util = require("util");
const zip = require("bestzip");
const ora = require("ora");
const path = require("path");
const os = require("os");
const FormData = require("form-data");

const mkdtemp = util.promisify(fs.mkdtemp);

/**
 * Download zip file from github repository
 */
exports.download = async function download() {
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
};

exports.downloadDefaultTheme = async function download() {
  const res = await fetch(
    "https://github.com/lowcodecms/soluneo-themes/archive/main.zip"
  );
  await new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream("./theme.zip");
    res.body.pipe(fileStream);
    res.body.on("error", (err) => {
      reject(err);
    });
    fileStream.on("finish", function () {
      resolve();
    });
  });
};



exports.extract = (file, dir) =>
  extract(file, {
    dir,
  });

exports.isInstalled = () => {
  if (fs.existsSync(".lowcodecms")) {
    throw chalk.red.bold(
      "LowCode CMS already installed. You can update this installation with update command\n"
    );
  }
};

exports.isNotInstalled = () => {
  if (!fs.existsSync(".lowcodecms")) {
    throw chalk.red.bold(
      "LowCode CMS is not installed in this directory. You can install it with sol setup command\n"
    );
  }
};

/**
 * create unique container names
 */
exports.prepareScripts = async function prepareScripts() {
  const dockerComposePath =
    process.cwd() + "/.lowcodecms/development-main/docker-compose.yml";
  const rand = nanoid(4);
  const dockerComposeFile = fs.readFileSync(dockerComposePath, "utf8");
  fs.writeFileSync(
    dockerComposePath,
    dockerComposeFile.replace(/\$rand/g, rand),
    "utf8"
  );
};

exports.cleanUpInstallation = () => fs.unlinkSync("./lowcodecms.zip");

exports.login = (ctx, task) => {
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
    setTimeout(() => {
      if (!ctx.token) {
        server.close();
        observer.complete();
      }
    }, 5000);

    p.then((token) => {
      observer.next(token);
      ctx.soltoken = token;
      server.close();
      observer.complete();
    }).catch((e) => {
      server.close();
      observer.complete();
    });
  });
};

exports.createAndUploadPackage = async (options, upload = false) => {
  const spinner = ora("Creating Package").start();
  spinner.color = "yellow";
  if (!fs.existsSync("./components") || !fs.existsSync("./package.json")) {
    spinner.fail("No LowCode CMS App found in this directory.\n");
    process.exit(1);
  }
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
        chalk.bgRed.white.bold(
          "Error installing package: " + result.statusText + result.status
        )
      );
      const error = await result.text();
      console.log(error);
      process.exit(1);
    } else {
      console.log(chalk.green.bold(" Package installed"));
    }
  } catch (e) {
    
    if (e.code === "ECONNREFUSED") {
      spinner.fail(
        `Could not install Package. ${chalk.bgRed.underline.white(` Connection to Server ${options.server} failed. `)}\n`
      );
      spinner.stop();
    } else {
      console.log(chalk.bgRed.white.bold(" Package installation error"));
      console.log(e);
    }
    process.exit(1);
  }
  spinner.stop();
};
