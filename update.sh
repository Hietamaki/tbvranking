#!/bin/bash

echo Updating
date
#cd ~/tbv

if [ $1 ]; then
	echo \# Fetching event $@ from tbv.fi
	node src/fetcher.js $@
fi

#rm events.db
node src/convert_to_db.js
node src/transform_data.js
node src/visualize.js
node src/visualize-players.js
rm html/index.html
cp `ls html/*.html | tail -n 1` html/index.html
cp -r html/* ../www/tbv/
