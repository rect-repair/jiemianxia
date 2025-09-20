#!/bin/bash
year=$(date +%Y)
month=$(date +%m)
day=$(date +%d)
hour=$(date +%H)
minute=$(date +%M)
dayofweek=$(date +%A)

if [ $hour -lt 6 ]; then
    time_mood="🌙 "
elif [ $hour -lt 12 ]; then
    time_mood="🌅 "  
elif [ $hour -lt 18 ]; then
    time_mood="☀️ "
else
    time_mood="🌆 "
fi

echo "$time_mood $dayofweek $year-$month-$day $hour:$minute"
