#!/bin/bash

# Earth Alliance RSS Feed Validator
# This tool validates all RSS endpoints in the Earth Alliance Source Roster
# and reports on their status

echo "🌐 EARTH ALLIANCE FEED VALIDATOR"
echo "=================================="
echo "Validating RSS feeds from EARTH_ALLIANCE_SOURCE_ROSTER.md"
echo ""

# Output files
RESULTS_FILE="ea_feed_validation_results.md"
JSON_RESULTS="ea_feed_validation.json"
WORKING_ENDPOINTS="ea_working_endpoints.md"

# Headers
echo "# 🌐 Earth Alliance Feed Validation Results" > $RESULTS_FILE
echo "## Generated on $(date)" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

echo "{" > $JSON_RESULTS
echo "  \"validation_date\": \"$(date)\",\n  \"results\": [" >> $JSON_RESULTS

echo "# 🌐 Earth Alliance Working Endpoints" > $WORKING_ENDPOINTS
echo "## Generated on $(date)" >> $WORKING_ENDPOINTS
echo "" >> $WORKING_ENDPOINTS
echo "The following endpoints were successfully validated and can be integrated into the dashboard:" >> $WORKING_ENDPOINTS
echo "" >> $WORKING_ENDPOINTS

# Counter variables
TOTAL_FEEDS=0
WORKING_FEEDS=0
PROBLEM_FEEDS=0

# Function to validate RSS feed
validate_feed() {
    local name="$1"
    local url="$2"
    local category="$3"
    
    echo "Testing: $name ($url)"
    
    # Try to fetch the RSS feed with a timeout
    HTTP_STATUS=$(curl -L --silent --output /dev/null --write-out "%{http_code}" --max-time 10 "$url")
    
    # Check if we got a successful response
    if [ "$HTTP_STATUS" -eq 200 ]; then
        # Further validate that it's actually RSS/XML content
        CONTENT_TYPE=$(curl -L --silent --head --max-time 5 "$url" | grep -i "content-type" | head -n 1)
        
        if [[ "$CONTENT_TYPE" == *"xml"* ]] || [[ "$CONTENT_TYPE" == *"rss"* ]] || [[ "$CONTENT_TYPE" == *"atom"* ]]; then
            echo "✅ SUCCESS: $name ($url)"
            echo "- ✅ **$name** ($category) - Feed working" >> $RESULTS_FILE
            echo "- **$name** - \`$url\`" >> $WORKING_ENDPOINTS
            if [ $TOTAL_FEEDS -gt 0 ]; then
                echo "," >> $JSON_RESULTS
            fi
            echo "    {" >> $JSON_RESULTS
            echo "      \"name\": \"$name\"," >> $JSON_RESULTS
            echo "      \"url\": \"$url\"," >> $JSON_RESULTS
            echo "      \"category\": \"$category\"," >> $JSON_RESULTS
            echo "      \"status\": \"working\"," >> $JSON_RESULTS
            echo "      \"http_status\": $HTTP_STATUS" >> $JSON_RESULTS
            echo "    }" >> $JSON_RESULTS
            WORKING_FEEDS=$((WORKING_FEEDS + 1))
        else
            echo "⚠️ WARNING: $name - HTTP 200 but not valid RSS content"
            echo "- ⚠️ **$name** ($category) - Not valid RSS content" >> $RESULTS_FILE
            if [ $TOTAL_FEEDS -gt 0 ]; then
                echo "," >> $JSON_RESULTS
            fi
            echo "    {" >> $JSON_RESULTS
            echo "      \"name\": \"$name\"," >> $JSON_RESULTS
            echo "      \"url\": \"$url\"," >> $JSON_RESULTS
            echo "      \"category\": \"$category\"," >> $JSON_RESULTS
            echo "      \"status\": \"invalid_format\"," >> $JSON_RESULTS
            echo "      \"http_status\": $HTTP_STATUS" >> $JSON_RESULTS
            echo "    }" >> $JSON_RESULTS
            PROBLEM_FEEDS=$((PROBLEM_FEEDS + 1))
        fi
    else
        echo "❌ FAILED: $name - HTTP Status: $HTTP_STATUS"
        echo "- ❌ **$name** ($category) - HTTP Status: $HTTP_STATUS" >> $RESULTS_FILE
        if [ $TOTAL_FEEDS -gt 0 ]; then
            echo "," >> $JSON_RESULTS
        fi
        echo "    {" >> $JSON_RESULTS
        echo "      \"name\": \"$name\"," >> $JSON_RESULTS
        echo "      \"url\": \"$url\"," >> $JSON_RESULTS
        echo "      \"category\": \"$category\"," >> $JSON_RESULTS
        echo "      \"status\": \"failed\"," >> $JSON_RESULTS
        echo "      \"http_status\": $HTTP_STATUS" >> $JSON_RESULTS
        echo "    }" >> $JSON_RESULTS
        PROBLEM_FEEDS=$((PROBLEM_FEEDS + 1))
    fi
    
    TOTAL_FEEDS=$((TOTAL_FEEDS + 1))
}

# Parse the source roster markdown file and extract RSS feeds
echo "Extracting feeds from roster..."

# Initialize current category
CURRENT_CATEGORY=""

# Read the file line by line
while IFS= read -r line; do
    # Check if line defines a category
    if [[ $line == "### "* ]]; then
        CURRENT_CATEGORY=$(echo "$line" | sed 's/### [0-9️⃣]* //' | sed 's/$//')
        echo "" >> $RESULTS_FILE
        echo "## $CURRENT_CATEGORY" >> $RESULTS_FILE
        echo "" >> $RESULTS_FILE
        
        echo "" >> $WORKING_ENDPOINTS
        echo "### $CURRENT_CATEGORY" >> $WORKING_ENDPOINTS
        echo "" >> $WORKING_ENDPOINTS
    fi
    
    # Look for rssFeed lines in the JSON blocks
    if [[ $line == *"\"rssFeed\""* ]]; then
        # Extract the URL
        URL=$(echo "$line" | sed 's/.*"rssFeed": *"//' | sed 's/",.*//')
        
        # Get the name from a previous line
        NAME=$(grep -B 5 -A 0 "$line" docs/EARTH_ALLIANCE_SOURCE_ROSTER.md | grep "\"name\"" | head -n 1 | sed 's/.*"name": *"//' | sed 's/",.*//')
        
        # Validate the feed
        validate_feed "$NAME" "$URL" "$CURRENT_CATEGORY"
    fi
done < docs/EARTH_ALLIANCE_SOURCE_ROSTER.md

# Finish the JSON file
echo "\n  ]" >> $JSON_RESULTS
echo "}" >> $JSON_RESULTS

# Add summary to results file
echo "" >> $RESULTS_FILE
echo "## Summary" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE
echo "- **Total Feeds Checked:** $TOTAL_FEEDS" >> $RESULTS_FILE
echo "- **Working Feeds:** $WORKING_FEEDS" >> $RESULTS_FILE
echo "- **Problem Feeds:** $PROBLEM_FEEDS" >> $RESULTS_FILE
echo "- **Success Rate:** $(( (WORKING_FEEDS * 100) / TOTAL_FEEDS ))%" >> $RESULTS_FILE

echo ""
echo "=================================="
echo "VALIDATION COMPLETE"
echo "Total Feeds: $TOTAL_FEEDS"
echo "Working: $WORKING_FEEDS"
echo "Problems: $PROBLEM_FEEDS"
echo "Success Rate: $(( (WORKING_FEEDS * 100) / TOTAL_FEEDS ))%"
echo ""
echo "Results saved to $RESULTS_FILE and $JSON_RESULTS"
echo "Working endpoints saved to $WORKING_ENDPOINTS"
