#!/bin/bash

# MCP Server Output Isolation Wrapper
# Redirects ALL output except MCP JSON protocol

# Create temporary files for capturing output
ERROR_LOG="/tmp/permamind-error-$$.log"
DEBUG_LOG="/tmp/permamind-debug-$$.log"

# Function to cleanup on exit
cleanup() {
    rm -f "$ERROR_LOG" "$DEBUG_LOG"
}
trap cleanup EXIT

# Start the actual server with complete output redirection
exec 3>&1  # Save original stdout
exec 4>&2  # Save original stderr

# Redirect stderr to log file, stdout stays for MCP protocol
exec 2>"$ERROR_LOG"

# Start the permamind server
node /Users/jonathangreen/Documents/MCP/permamind/dist/server.js

# If we get here, server exited - restore stderr and show any errors
exec 2>&4
if [ -s "$ERROR_LOG" ]; then
    echo "Server errors logged to: $ERROR_LOG" >&2
fi