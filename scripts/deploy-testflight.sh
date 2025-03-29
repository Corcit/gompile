#!/bin/bash

# Exit on error
set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting TestFlight deployment process...${NC}"

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${RED}EAS CLI is not installed. Installing now...${NC}"
    npm install -g eas-cli
fi

# Check if user is logged in to EAS
echo -e "${YELLOW}Checking EAS login status...${NC}"
eas whoami || (
    echo -e "${RED}Not logged in to EAS. Please login:${NC}"
    eas login
)

# Update dependencies
echo -e "${YELLOW}Updating dependencies...${NC}"
npm install

# Verify app.json and eas.json have been properly configured
echo -e "${YELLOW}Checking configuration files...${NC}"
if grep -q "APPLE_ID_HERE" eas.json; then
    echo -e "${RED}Please update eas.json with your Apple credentials before continuing.${NC}"
    echo -e "You need to set your Apple ID, Apple Team ID, and App Store Connect App ID."
    exit 1
fi

# Validate ownership of the app
echo -e "${YELLOW}Validating ownership...${NC}"
eas project:info

# Build the app for TestFlight
echo -e "${GREEN}Building app for TestFlight...${NC}"
echo -e "${YELLOW}This may take a while...${NC}"
eas build --platform ios --profile test

# Ask user if they want to submit to TestFlight
echo -e "${YELLOW}Do you want to submit this build to TestFlight? (y/n)${NC}"
read -r submit_answer

if [[ "$submit_answer" == "y" || "$submit_answer" == "Y" ]]; then
    echo -e "${GREEN}Submitting to TestFlight...${NC}"
    eas submit -p ios --profile test
    echo -e "${GREEN}Submission complete! Check App Store Connect for status.${NC}"
else
    echo -e "${YELLOW}Skipping submission. You can manually submit later with:${NC}"
    echo -e "${GREEN}eas submit -p ios --profile test${NC}"
fi

echo -e "${GREEN}TestFlight deployment process completed!${NC}" 