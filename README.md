# TacticalIntelDashboard
A Touch-Interface Intel Command Console that runs in browser locally for RSS Aggregation and Data Feed Auto-Scroll

## Setup and Installation

### Prerequisites
- **Node.js (v18 or higher)**: Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine.
- **npm**: npm is the package manager for Node.js.
- **Git**: Git is a version control system.

### Setting up Node.js, npm, and Git on Ubuntu Linux
1. **Update your package list**:
    ```sh
    sudo apt update
    ```

2. **Install Git**:
    ```sh
    sudo apt install git -y
    ```
    This command will install Git on your system.

3. **Install Node.js and npm**:
    ```sh
    sudo apt install nodejs npm -y
    ```
    This command will install Node.js and npm on your system.

4. **Verify the installations**:
    ```sh
    node -v
    npm -v
    git --version
    ```
    These commands will print the installed versions of Node.js, npm, and Git. Ensure that Node.js is v18 or higher and npm is installed.

### Steps
1. **Clone the repository**:
    ```sh
    git clone https://github.com/jthora/TacticalIntelDashboard.git
    ```
    This command will create a local copy of the repository on your machine.

2. **Navigate to the project directory**:
    ```sh
    cd TacticalIntelDashboard/IntelCommandConsole
    ```
    Change your current directory to the project directory.

3. **Install the dependencies**:
    ```sh
    npm install
    ```
    This command will install all the required packages listed in the `package.json` file.

4. **Start the application**:
    ```sh
    npm run dev
    ```
    This command will start the development server.

5. **Open your browser and go to**:
    ```
    http://localhost:5173
    ```
    Open this URL in your web browser to see the Tactical Intel Dashboard running.

### Setting up CORS Anywhere Proxy Server

1. **Clone the CORS Anywhere repository**:
    
    Escape back to the containing folder to clone the proxy server directory
    ```sh
    cd ..
    ```

    ```sh
    git clone https://github.com/Rob--W/cors-anywhere.git
    ```
    This command will create a local copy of the CORS Anywhere repository on your machine.

2. **Navigate to the CORS Anywhere directory**:
    ```sh
    cd cors-anywhere
    ```
    Change your current directory to the CORS Anywhere directory.

3. **Install the dependencies**:
    ```sh
    npm install
    ```
    This command will install all the required packages listed in the `package.json` file of the CORS Anywhere project.

4. **Modify `server.js` file with the following content**:
    ```javascript
    // Listen on a specific host via the HOST environment variable
    var host = process.env.HOST || '0.0.0.0';
    // Listen on a specific port via the PORT environment variable
    var port = process.env.PORT || 8081;

    // Grab the blacklist from the command-line so that we can update the blacklist without deploying
    // again. CORS Anywhere is open by design, and this blacklist is not used, except for countering
    // immediate abuse (e.g. denial of service). If you want to block all origins except for some,
    // use originWhitelist instead.
    var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
    var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);
    function parseEnvList(env) {
      if (!env) {
        return [];
      }
      return env.split(',');
    }

    // Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
    var checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);

    var cors_proxy = require('./lib/cors-anywhere');
    cors_proxy.createServer({
      originBlacklist: originBlacklist,
      originWhitelist: originWhitelist,
      requireHeader: ['origin', 'x-requested-with'],
      checkRateLimit: checkRateLimit,
      removeHeaders: [
        'cookie',
        'cookie2',
        // Strip Heroku-specific headers
        'x-request-start',
        'x-request-id',
        'via',
        'connect-time',
        'total-route-time',
      ],
      setHeaders: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept',
      },
      // Add logging for debugging
      handleInitialRequest: function(req, res, location) {
        console.log('Proxying request to: ' + location.href);
        return false; // Continue with the proxy request
      },
      // Handle redirects
      redirectSameOrigin: true,
      httpProxyOptions: {
        followRedirects: true,
      },
    }).listen(port, host, function() {
      console.log('Running CORS Anywhere on ' + host + ':' + port);
    });
    ```
    Open and edit `server.js` in the CORS Anywhere directory and paste the above code into it.

5. **Start the CORS Anywhere server**:
    ```sh
    npm start
    ```
    This command will start the CORS Anywhere proxy server.

6. **The CORS Anywhere proxy server will be running at**:
    ```
    http://localhost:8081
    ```
    Open this URL in your web browser to verify that the CORS Anywhere proxy server is running.
