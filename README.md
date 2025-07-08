# Factory Collabo Demo

## Dependencies
### SDKs in use (version)
* HOOPS Communicator (2025.4.0)
* node (v18.20.7)
* npm (v10.8.2)

### Tested server platforms
* Windows 11

## Setup
1. Copy the following files from `<HOOPS Communicator SDK>\web_viewer\` to `factory_collabo\js` folder: <br>
    `hoops-web-viewer.mjs`, `engine.esm.wasm`
2. Copy the following file from `<HOOPS Communicator SDK>\web_viewer\demo-app\script` to `factory_collabo\js` folder: <br>
    `jquery-3.5.1.min.js`
3. Unzip `model_data.zip` and copy SC folders in your model_file folder
4. Start cmd and navigate to the \factory_collabo folder and run: `npm install`
5. Start server: `node index.js`
6. Start HC server: `<HOOPS Communicator SDK>\quick_start\start_server.bat`
7. Open this demo using web browser: http://localhost:3000/