#!/bin/bash

clear

# current info
USERNAME=$(whoami)
COMPUTER=$(uname)
HOUR=$(date +%H)
TIME_OF_DAY="evening"

if [ $HOUR -lt 12 ]; then
    TIME_OF_DAY="morning"
elif [ $HOUR -lt 17 ]; then
    TIME_OF_DAY="afternoon"
fi

echo "awakening..."
sleep 1

echo
echo " ⋆｡ﾟ ☁︎ ｡⋆ ｡ ﾟ ☾ ﾟ｡ ⋆ ☁︎｡ ⋆"
sleep 0.7
echo " - - - - - - - - - - - -"
sleep 0.7
echo "  ˚   ┊  ┊  ┊  ♡  ┊"
sleep 0.7
echo "      ┊  ┊  ┊  ˚  ♡"
sleep 0.7
echo "      ┊  ┊  ♡  ┊    +"
sleep 0.7
echo "      ♡  ⋆  ┊  ."
sleep 0.7
echo "         +  ♡"
sleep 0.7
echo "            ⋆"
sleep 0.7


cat << EOF

╭───────────────────────────╮


  good $TIME_OF_DAY, $USERNAME ☾
    
  the moon rises 
  in approximately:
  $(( (20 - $HOUR + 24) % 24 )) hours
    
  ☾ remember to look up tonight


╰───────────────────────────╯
EOF
sleep 0.7

echo
sleep 0.7
echo "☾"
sleep 0.7
echo "...spell complete. i love you."
sleep 0.7
say "this is a message from your computer, $COMPUTER"
