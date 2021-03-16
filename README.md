# LowCode CMS CLI (Beta)

This is the Soluneo LowCode CMS CommandLine Tool to help with local development and to manage your Server in the Cloud.

![alt text](https://raw.githubusercontent.com/lowcodecms/soluneo-cli/5a886d6fffde76d684fd0b63a41fda8291f2226c/sol-cli.gif?token=AAPTP3TMZCQLTB3V2BXSRU3AKDLEK)
> LowCode CMS is not Generally Available yet. This is a Technology Preview for Early Adapters.
> Interested to learn more? Visit us on www.lowcodecms.com or register directly on https://my.lowcodecms.com

## Getting Started

LowCode CMS CLi requires a local Docker installation (see https://docs.docker.com/get-docker/).

> You need to register at https://my.lowcodecms.com in order to be able to login and download the development build. Until GA, once you are registered, you have to click the _claim developer access_ button to request access to the developer preview program. 

### Installation

```shell
npm install @lowcodecms/cli -g 
```
or with Yarn

```shell
yarn global add @lowcodecms/cli
```

### Login
To be able to get updates and install LowCode CMS Developer build on your machine, you need to perform once a login on your computer.

```shell
sol login
```

This will open your Browser to authenticate to my.lowcodecms.com. You can follow the instructions in the Browser window.


# Local Development

Each LowCode CMS installation has to be in it's own folder, since the CLI will create a hidden subdirectory _.lowcodecms_ in the directory you perform the setup command.

Before you can setup your local development instance, you have to 
perform one time the ```sol login``` command. This is authenticating you globally in your system:

- ```sol setup```
  - in directory you want to setup the dev server. If the choosen directory will hold the Application code, don't forget to add ```.lowcodecms``` to your .gitignore file
- ```sol start```
  - In the installation directory

It might take a while the first time because the CLI is downloading all microservice images. To see detailed progress you can open another terminal window and check status with ```sol logs -f```.

Right now the local LowCode CMS instance is starting on port 80 - this will be configurable in future.

After succesful installation the CLI will open your Browser at http://localhost/console/


# Command Line Overview
- ```sol setup```
  - in directory you want to install the dev server (should be another directory then application code)
- ```sol start```
  - in installation directory to start the LowCode CMS
- ```sol stop```
  - in installation directory to stop running instance
- ```sol update```
  - In installation directory. This is updating the local development to latest LowCode CMS development version
- ```sol logs```
  - in installation directory. display last 100 logs
- ```sol --help```

<pre>
sol &lt;command&gt;

Commands:
  sol install [options]  Install local app project on LowCode CMS Server
  sol login              Prepare current directory to install LowCode CMS
  sol logs [options]     Show Logfiles
  sol setup              Prepare current directory to install LowCode CMS
  sol start [options]    Start LowCode CMS
  sol stop               Stop LowCode CMS
  sol update             update local installation to latest Cloud version.

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
</pre>

> Note: It is save to perform ```sol update``` in existing installation directories. instance data will not be overwritten.


# Usage

In directory with application code (first download some app from your instance or try https://github.com/solutas/solutas.ch as an example) run following command to start the watch mode:

```
sol install -w
```

or 

```
sol install
```

if you just want to install the application without update on local file changes.

# Notes
> If you don't have access to this repository yet get in touch with your point of contact. 

Once installed trigger ```Site > Build``` in Console to update the build to include the new Apps.
