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

const chalk = require("chalk");

module.exports = () => {
  console.log(chalk.underline("                                   "));
  console.log(chalk.bgBlue.white.bold("                                   "));
  console.log(chalk.bgBlue.white.bold("       LowCode CMS | CLI           "));
  console.log(chalk.bgBlue.white("      www.lowcode-cms.com          "));
  console.log(chalk.bgBlue.white.bold("                                   "));
  console.log(chalk.bgRed.underline.white(" Early Access Technologie Preview  \n"));
};
