### Skytact API
## own skytact cloud center + ssl

# must have:
- OS Linux Debian/Ubuntu
- NodeJS ^12.0.0
- npm ^5.0.0
- git
- MongoDB ^4.2
- static ip and Domain name

# setup guide:
`sh
# create new dir
mkdir skytact_server
cd skytact_server

# clone from git
git clone https://github.com/skytact/skytact-api.git

# move to project_dir
cd skytact-api

# install all dependencies
npm init -y
npm install

# test dev mode
npm run api
^C
npm run cloud
^C

# enable ssl by letsencrypt (you may use another way to install ssl cert)
# example from "geenlock-express"
npx greenlock init --config-dir ./greenlock.d --maintainer-email 'jon@example.com'
npx greenlock add --subject example.com --altnames example.com

rm server.js
rm app.js

# testing
# generated fake cert key

node api-server.js --staging
# node cloud-server.js --staging

# try release version

node api-server.js
# node cloud-server.js
`

# develop (testing) ports:
4747 (dev api)
4748 (dev cloud api)

# ports:
2728 (api)
2728 (cloud api)

# use pm2 to enable services
`sh

pm2 start api-server.js
pm2 start cloud-server.js

pm2 list
`

# Good luck!
