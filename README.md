# Factory Collabo Demo

## Dependencies
### SDKs in use (version)
* HOOPS Communicator (2025.4.0)
* node (v18.20.7)
* npm (v10.8.2)

### Tested server platforms
* Windows 11

## Setup
1. Copy the following files from <HOOPS Communicator SDK>\web_viewer\ in factory_collabo\js folder
    hoops-web-viewer.mjs, engine.esm.wasm, jquery-3.3.1.min.js
2. Unzip model_data.zip and copy SC folders in your model_file folder
3. Start cmd and navigate to the \factory_collabo folder and run: npm install
3. Start server: node index.js
4. Start <HOOPS Communicator SDK>\quick_start\start_server.bat
5. Open this demo using web browser: http://localhost:3000/