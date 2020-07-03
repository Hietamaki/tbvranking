#!/bin/bash
#crontab lines:
#14,29,44,59 20-23 * 5-8 3 ~/tbvranking/autoupdate.sh >> ~/tbv-auto-updater.log
#0 10,12 * 5-8 4 ~/tbvranking/autoupdate-nextday.sh >> ~/tbv-auto-updater.log

cd ~/tbvranking
node src/fetch_event_ids.js
./update.sh $(< cache/new_events.dat)
