#!/bin/bash

echo Updating
date
#cd ~/tbv

if [ $1 ]; then
	echo \# Fetching event $@ from tbv.fi
	node src/fetcher.js $@
fi

node src/convert_to_db.js
node src/transform_data.js
node src/visualize-events.js
node src/visualize-players.js
node src/visualize-rankings.js
node src/visualize-index.js
cp static/* html
#rm html/index.html
#cp `ls -v html/*.html | tail -n 1` html/index.html
cp -r html/* ../www/tbv/
