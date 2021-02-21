# LowCode CMS CLI (Beta)

This is the Soluneo LowCode CMS CommandLine Tool to help with local development and to manage your Server in the Cloud.

> LowCode CMS is not Generally Available yet.

## Getting Started

LowCode CMS CLi requires a local Docker installation (see https://docs.docker.com/get-docker/).

> You need to register at https://my.lowcodecms.com in order to be able to login and download the development build. Until GA, once you are registered, you have to click the _claim developer access_  button to request access to the developer preview program. 

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

Each LowCode CMS installation has to be in it's own folder, since the CLI will create a subdirectory _lowcodecms_ in the directory you perform the install command.

Assuming you have executed the ```sol login``` command successfully you nede to perform following steps:

- ```sol install```
  - in directory you want to install the dev server (should be another directory then application code)
- ```sol start```
  - in installation directory

It might take a while the first time because the CLI is downloading all microservices images. To see progress you can open another terminal window and check status with ```sol logs```.

Right now the local LowCode CMS instance is starting on port 80 - this will be configurable in future.

After succesful installation the CLI will open your Browser at http://localhost/console/


# Command Line Overview
- ```sol install```
  - in directory you want to install the dev server (should be another directory then application code)
- ```sol start```
  - in installation directory to start the LowCode CMS
- ```sol stop```
  - in installation directory to stop running instance
- ```sol update```
  - In installation directory. This is updating the local development to latest LowCode CMS development version
- ```sol logs```
  - in installation directory. display last 100 logs

> Note: It is save to perform ```sol install``` and ```sol update``` in existing installation directories. instance data will not be overwritten.

# Usage

In directory with application code (first download some app from your instance or try https://github.com/solutas/solutas.ch as an example) run following command to start the watch mode:

```
sol --username *** --password **** --server http://localhost
```



# Notes

> If you don't have access to this repository yet get in touch with your point of contact. 

Install the https://github.com/lowcodecms/system-app in the Development Preview it will not be automatically installed. Once LowCode CMS will be general available, this doesn't have to be done anymore.

Clone the reposistory and start watch mode 
```
sol --username *** --password **** --server http://localhost

```

- Then touch a file to install the package. In future this will be automatically installed.
- in console/settings/tools update "themes" to get the lates bootstrap 5 and sass package installed.

Once installed trigger Site > Build in Console to update the build to include the new Apps.
