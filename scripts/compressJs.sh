#!/bin/sh
PTOOL='/usr/local/lib/node_modules/uglify-js/bin/uglifyjs'
BASE_DIR=`dirname $0`

JSBASE=$BASE_DIR/../app/js
FILE_LIST=$JSBASE'/UmlLib.js'
echo $FILE_LIST
echo $PTOOL $FILE_LIST -o $JSBASE/UmlLib.min.js
$PTOOL $FILE_LIST -o $JSBASE/UmlLib.min.js
