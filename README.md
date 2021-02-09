# soluneo-cli

soluneo cli

yarn install
yarn link

# local development server

right now only one is working at one machine until $rand function is implemented.

- ```sol login```
  - somewhere for global login
- ```sol install```
  - in directory you want to isntall the dev server (should be another dierctory then application code)
- ```sol start```
  - in installation directory
- ```sol stop```
  - in installation directory

right now it is starting on port 80 - will be configurable in future.

# usage

in directory with application code (first download some app from your instance or try https://github.com/solutas/solutas.ch as an example)

```
sol --username *** --password **** --server http://localhost
```

will start watch mode
