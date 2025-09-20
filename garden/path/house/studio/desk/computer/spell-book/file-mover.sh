echo "⇥✦⇥✦ file ⇥✦⇥✦ mover ⇥✦⇥✦"

# get file path
echo "what's the path to your file?"
echo "(you can drag and drop the file here, or type the path)"
read -r image_path

# clean up the path - remove surrounding quotes and trim whitespace
image_path=$(echo "$image_path" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")

# remove quotes if they drag-and-dropped
image_path="${image_path%\"}"

# check if file exists
if [ ! -f "$image_path" ]; then
    echo "❌ File not found: $image_path"
    exit 1
fi

# cet file extension
ext="${image_path##*.}"

# cet new name
echo ""
echo "what should we call this file?"
echo "(example: i-love-my-computer, cat-on-my-face)"
read -r new_name

# validate new name (no spaces, special chars)
if [[ "$new_name" =~ [^a-zA-Z0-9_-] ]]; then
    echo "⚠️  Name should only have letters, numbers, dashes, and underscores"
    echo "Converting spaces to dashes..."
    new_name="${new_name// /-}"
fi


# convert spaces to dashes
new_name="${new_name// /-}"

# copy to current directory
cp "$image_path" "${new_name}.${ext}"

echo ""
echo "copied to: $(pwd)/${new_name}.${ext}"

# optional: add note
echo ""
echo "want to add a note about this file? (optional, enter to skip)"
read -r note

if [ ! -z "$note" ]; then
    echo "$note" > "${new_name}-note.txt"
    echo "note saved as ${new_name}-note.txt"
fi

echo ""
echo "done!"