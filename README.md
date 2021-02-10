# soluneo-cli

soluneo cli

yarn install
yarn link

# local development server

You can have multiple installation in own folder. 

- ```sol login```
  - somewhere for global login
- ```sol install```
  - in directory you want to isntall the dev server (should be another dierctory then application code)
- ```sol start```
  - in installation directory
- ```sol stop```
  - in installation directory

- ```sol logs```
  - in installation directory. display last 100 logs

right now it is starting on port 80 - will be configurable in future.

it might take a while the first time because the cli is downloading all server images. to see progress you can open another terminal window and check status with sol logs.

it is save to perform ```sol install``` in existing installation directories. instance data will not be overwritten.

# usage

in directory with application code (first download some app from your instance or try https://github.com/solutas/solutas.ch as an example)

```
sol --username *** --password **** --server http://localhost
```

will start watch mode


# notes

install the https://github.com/lowcodecms/system-app it will not be automatically installed

clone the reposistory and start watch mode 
```
sol --username *** --password **** --server http://localhost

```
then touch a file to install the package. in future this will be automatically installed.

also in console/settings/tools update "themes" to get the lates bootstrap5 and sass package installed.

you need to save in sites themes once to rebuild the css files - same has to be done if an app css or client javascript file is changed.