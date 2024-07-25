#!/bin/bash

# Define the root directory
root_dir="src"

# Define the structure of directories and files
file_structure=(
    "components/FileInput.js"
    "components/ActionButtons.js"
    "components/FileDetails.js"
    "components/HashHistory.js"
    "components/Logs.js"
    "hooks/useFileTracker.js"
    "utils/blockchain.js"
    "utils/fileHandling.js"
    "utils/errorHandling.js"
    "constants/contractConfig.js"
    "styles/App.css"
    "styles/index.css"
    "App.js"
    "FileTracker.js"
    "index.js"
)

# Function to create files if they don't exist
create_files() {
    local root=$1
    local structure=("$@")
    
    # Create directories and files
    for path in "${structure[@]:1}"; do
        # Create directory path
        dir_path=$(dirname "$root/$path")

        # Create directory if it doesn't exist
        if [[ ! -d $dir_path ]]; then
            mkdir -p "$dir_path"
        fi

        # Create file if it doesn't exist
        file_path="$root/$path"
        if [[ ! -f $file_path ]]; then
            touch "$file_path"
            echo "Created: $file_path"
        else
            echo "Skipped (already exists): $file_path"
        fi
    done
}

# Function to clean up files not in the desired structure
cleanup_files() {
    local root=$1
    local structure=("$@")
    
    # Find all files in the root directory
    find "$root" -type f | while read -r file; do
        # Get the relative path of the file
        relative_path="${file#$root/}"
        
        # Check if the file is in the desired structure
        if [[ ! " ${structure[*]} " =~ " ${relative_path} " ]]; then
            rm "$file"
            echo "Deleted: $file"
        fi
    done
}

# Create the file structure
create_files "$root_dir" "${file_structure[@]}"

# Clean up files not in the desired structure
cleanup_files "$root_dir" "${file_structure[@]}"

echo "File structure creation and cleanup complete."
