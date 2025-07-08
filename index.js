var app = require('express')();
var serveStatic = require('serve-static');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var usersConnected = 0;

var sharedCamera = '{"position":{"x":17659.919348039737,"y":52362.37644771221,"z":1352.0856142151429},"target":{"x":27555.80822332009,"y":51834.791296864605,"z":314.14414225844394},"up":{"x":0.10401986316290744,"y":-0.005545670115095642,"z":0.9945597586925305},"width":9964.149755794933,"height":9964.149755794933,"projection":1,"nearLimit":0.01,"className":"Communicator.Camera"}';

app.use(serveStatic(__dirname + '/' ));
app.get('/', function(req, res){
	//res.sendFile(__dirname + '/viewer.html');
	res.sendFile(__dirname + '/factory_collabo.html');
});

io.on('connection', function(socket){
	usersConnected += 1;
	io.emit('userConnectChange', usersConnected, sharedCamera );

	socket.on('cameraChange', function(camera){
		socket.broadcast.emit('cameraChange', camera);
		sharedCamera = camera;
	});

	socket.on('getCamera', function(){
		io.emit('getCamera', sharedCamera);
	});

	socket.on('selectionChange', function(selection){
		socket.broadcast.emit('selectionChange', selection);
	});

	socket.on('drawModeChange', function(drawMode){
		socket.broadcast.emit('drawModeChange', drawMode);
	});

	socket.on('modelChange', function(modelToLoad){
		socket.broadcast.emit('modelChange', modelToLoad);
	});

	socket.on('toolTip', function( nodeId, position, info ) {
		socket.broadcast.emit('toolTip', nodeId, position, info );
	});

	socket.on('controlLock', function( isOn ) {
		socket.broadcast.emit('controlLock', isOn );
	});

	socket.on('viewCreated', function( markupView ) {
		socket.broadcast.emit('viewCreated', markupView );
	});

	socket.on('handleRedline', function(redlineItem, className, update) {
		socket.broadcast.emit('handleRedline', redlineItem, className, update);
	});

	socket.on('disconnect', function () {
		if( usersConnected > 0 ){
			usersConnected -= 1;
			io.emit('userConnectChange', usersConnected );
		}
	 });

});

http.listen(3000, function(){
	console.log('listening on *:3000');

	// Get robot parts matrix data
	var weldRobotMatrix = require('./WeldRobotMatrixData.js');
	var weldTargetCnt = weldRobotMatrix.targetCnt;
	var weldMatrix = weldRobotMatrix.matArr;

	var spotRobotMatrix = require('./SpotWeldRobotMatrixData.js');
	var spotTargetCnt = spotRobotMatrix.targetCnt;
	var spotMatrix = spotRobotMatrix.matArr;
	
	var pickRobotMatrix = require('./PickUpRobotMatrixData.js');
	var pickTargetCnt = pickRobotMatrix.targetCnt;
	var pickMatrix = pickRobotMatrix.matArr;

	var frameCnt = pickMatrix.length / pickTargetCnt;
	var matCopy = pickMatrix.concat();
	for (var i = frameCnt - 1; i >= 0; i--) {
		for (var j = 0; j < pickTargetCnt; j++) {
			pickMatrix.push(matCopy[i * pickTargetCnt + j]);
		}
	}

	var CMMMachineMatrix = require('./CMMatrixData.js');
	var CMMTargetCnt = CMMMachineMatrix.targetCnt;
	var CMMMatrix = CMMMachineMatrix.matArr;

	function getRobotMatrix(robotInstance) {
		// Reset O-number
		if (0 == robotInstance.currentStep) {
			robotInstance.ONum = ('0000' + Math.floor(Math.random() * 10000)).slice(-4);
		}

		var matrixArr = [];
		switch (robotInstance.type) {
			case "WELD": {
				for(var i = 0; i < weldTargetCnt; i++) {
					matrixArr.push(weldMatrix[weldTargetCnt * robotInstance.currentStep + i])
				}
				robotInstance.currentStep++;
				if (weldMatrix.length / weldTargetCnt <= robotInstance.currentStep) {
					robotInstance.currentStep = 0
				}
			}
			break;

			case "SPOT": {
				for(var i = 0; i < spotTargetCnt; i++) {
					matrixArr.push(spotMatrix[spotTargetCnt * robotInstance.currentStep + i])
				}
				robotInstance.currentStep++;
				if (spotMatrix.length / spotTargetCnt <= robotInstance.currentStep) {
					robotInstance.currentStep = 0
				}
			}
			break;

			case "PICK": {
				for(var i = 0; i < pickTargetCnt; i++) {
					matrixArr.push(pickMatrix[pickTargetCnt * robotInstance.currentStep + i])
				}
				robotInstance.currentStep++;
				if (pickMatrix.length / pickTargetCnt <= robotInstance.currentStep) {
					robotInstance.currentStep = 0
				}
			}
			break;

			case "CMM": {
				for(var i = 0; i < CMMTargetCnt; i++) {
					matrixArr.push(CMMMatrix[CMMTargetCnt * robotInstance.currentStep + i])
				}
				robotInstance.currentStep++;
				if (CMMMatrix.length / CMMTargetCnt <= robotInstance.currentStep) {
					robotInstance.currentStep = 0
				}
			}
			break;
		}

		return matrixArr;
	}

	var interval = 200;

	// Create robot instance
	robotInstanceArr = [];

	for (var i = 0; i < 18; i++) {
		robotInstance = {
			status: "RUN",
			currentStep: 0 
		};
		robotInstanceArr.push(robotInstance);
	}
	robotInstanceArr[0].type = "WELD";
	robotInstanceArr[1].type = "WELD";
	robotInstanceArr[2].type = "WELD";
	robotInstanceArr[3].type = "PICK";
	robotInstanceArr[4].type = "SPOT";
	robotInstanceArr[5].type = "CMM";
	robotInstanceArr[6].type = "PICK";
	robotInstanceArr[7].type = "PICK";
	robotInstanceArr[8].type = "PICK";
	robotInstanceArr[9].type = "CMM";
	robotInstanceArr[10].type = "SPOT";
	robotInstanceArr[11].type = "PICK";
	robotInstanceArr[12].type = "SPOT";
	robotInstanceArr[13].type = "WELD";
	robotInstanceArr[14].type = "SPOT";
	robotInstanceArr[15].type = "CMM";
	robotInstanceArr[16].type = "WELD";
	robotInstanceArr[17].type = "WELD";

	var intervalId = setInterval(function () {
		// occur stop / alarm 
		var randum = Math.floor( Math.random() * 100 );
		if (0 == randum) {
			var id = Math.floor( Math.random() * 18 );

			if ("RUN" == robotInstanceArr[id].status) {
				robotInstanceArr[id].status = "STOP";
				robotInstanceArr[id].stopTime = (Math.floor( Math.random() * 6 ) + 2) * 10000;
			}
		}
		else if (1 == randum) {
			var id = Math.floor( Math.random() * 18 );

			if ("RUN" == robotInstanceArr[id].status) {
				robotInstanceArr[id].status = "ALARM";
				robotInstanceArr[id].stopTime = (Math.floor( Math.random() * 8 ) + 4) * 10000;
			}
		}
		
		robotStatusArr = [];
		for (var i = 0; i < robotInstanceArr.length; i++) {
			var robotInstance = robotInstanceArr[i];

			var robotStatus = {
				status: robotInstance.status
			};

			switch (robotInstance.status) {
				case "IDLE" : {
					robotStatus.matArr = getRobotMatrix(robotInstance);
					robotInstance.currentStep = 0;

					robotInstance.stopTime -= interval;
					if (0 >= robotInstance.stopTime) {
						robotInstance.currentStep = 0;
						robotInstance.status = "RUN";
					}
				}
				break;

				case "RUN": {
					robotStatus.matArr = getRobotMatrix(robotInstance);;
					robotStatus.ONum = robotInstance.ONum;

					// shut down / stop for a while
					if (0 == robotInstance.currentStep) {
						var randum = Math.floor( Math.random() * 10 );
						if (0 == randum) {
							robotInstance.status = "SHUT_DOWN";
							robotInstance.stopTime = (Math.floor( Math.random() * 6 ) + 5) * 10000;
						}
						else {
							robotInstance.status = "IDLE";
							robotInstance.stopTime = (Math.floor( Math.random() * 10 ) + 1) * 1000;
						}

					}
				}
				break;

				case "STOP": {
					robotStatus.matArr = getRobotMatrix(robotInstance);
					robotInstance.currentStep--;

					robotStatus.ONum = robotInstance.ONum;

					robotInstance.stopTime -= interval;
					if (0 >= robotInstance.stopTime) {
						robotInstance.status = "RUN";
					}
				}
				break;
				
				case "ALARM" : {
					robotStatus.matArr = getRobotMatrix(robotInstance);
					robotInstance.currentStep--;
					
					robotStatus.ONum = robotInstance.ONum;
					robotStatus.alermReason = "Program error";

					robotInstance.stopTime -= interval;
					if (0 >= robotInstance.stopTime) {
						robotInstance.currentStep = 0;
						robotInstance.status = "IDLE";
						robotInstance.stopTime = (Math.floor( Math.random() * 10 ) + 1) * 1000;
					}
				}
				break;

				case "SHUT_DOWN" : {
					robotInstance.stopTime -= interval;
					if (0 >= robotInstance.stopTime) {
						robotInstance.currentStep = 0;
						robotInstance.status = "IDLE";
						robotInstance.stopTime = (Math.floor( Math.random() * 10 ) + 1) * 1000;
					}
				}
				break;
			}

			robotStatusArr.push(robotStatus);
		}

		io.emit('updateRobots', robotStatusArr);
	}, interval);

});
