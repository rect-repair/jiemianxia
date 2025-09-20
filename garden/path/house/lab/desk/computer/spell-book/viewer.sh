
function show_tree() {
    local dir="$1"
    local prefix="$2"
    
    # count total items
    local items=()
    for item in "$dir"/*; do
        [ -e "$item" ] && items+=("$(basename "$item")")
    done
    local total=${#items[@]}
    local current=0
    
    for item in "$dir"/*; do
        [ ! -e "$item" ] && continue
        
        local basename=$(basename "$item")
        current=$((current + 1))
        
        # determine tree symbol
        if [ $current -eq $total ]; then
            local tree_symbol="└── "
            local new_prefix="${prefix}    "
        else
            local tree_symbol="├── "
            local new_prefix="${prefix}│   "
        fi
        
        if [ -d "$item" ]; then
            echo "${prefix}${tree_symbol}$basename/"
            show_tree "$item" "$new_prefix"
        elif [[ "$basename" == *.txt ]]; then
            echo "${prefix}${tree_symbol}$basename"
            if [ -r "$item" ]; then
                line_count=$(wc -l < "$item")
                
                if [ $line_count -le 20 ]; then
                    cat "$item" | sed "s/^/${new_prefix}/"
                else
                    head -3 "$item" | sed "s/^/${new_prefix}/"
                    echo "${new_prefix}... ($((line_count - 3)) more lines)"
                fi
            fi
            echo "" # new line

        elif [[ "$basename" =~ \.(jpg|jpeg|png|gif)$ ]]; then
            echo "${prefix}${tree_symbol}$basename"
            local note_file="${item%.*}-note.txt"
            if [ -f "$note_file" ]; then
                echo "${new_prefix}$(cat "$note_file")"
            fi
        else
            echo "${prefix}${tree_symbol}$basename"
        fi
    done
}

echo "$(basename "$(pwd)")/"
show_tree "." ""