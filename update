#!/bin/bash

echo Updating
date
#cd ~/tbv

if [ $1 ]; then
	echo \# Fetching event $@ from tbv.fi
	node fetcher.js $@
fi

#rm events.db
node convert_to_db.js
node visualize.js
node visualize-players.js
rm html/index.html
cp `ls html/*.html | tail -n 1` html/index.html
cp -r html/* ../www/tbv/
