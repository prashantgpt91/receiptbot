var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var exec = require('ssh-exec')
const uuidV1 = require('uuid/v1');

var Uploader = require('s3-image-uploader');
var uploader = new Uploader({
    aws: {
        key: 'AKIAJVUPIH3XKJYTLA5Q',
        secret: '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'
    },
    websocketServer: server,
    websocketServerPort: 3004,
});

// Asynchronous read
var myKeyFileOrBuffer = "";
require("fs").readFile('OCR.pem', function(err, data) {
    if (err) {
        return console.error(err);
    }
    myKeyFileOrBuffer = data.toString();
});


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
})

app.get('/runpython', function(req, res) {
    //console.log("running python");
    exec('cd receiptbot && python2 hello.py https://s3.amazonaws.com/cloudadic/ocr/uploads/bill99.jpg', {
        user: 'ubuntu',
        host: 'ec2-52-202-254-92.compute-1.amazonaws.com',
        key: myKeyFileOrBuffer
    }).pipe(process.stdout)

});

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

io.on('connection', function(client) {
    client.on("processReceipt", function(data) {
        var imageData = data.imageData
        if (data != null && imageData != null && typeof imageData != 'undefined') {

            new Promise(function(resolve, reject) {
                var type = imageData.substring("data:image/".length, imageData.indexOf(";base64"));
                var filename = uuidV1();
                filename = filename + '.' + type;
                var imageBuffer = decodeBase64Image(imageData);
                require("fs").writeFile(__dirname + '/public/image/' + filename, imageBuffer.data, 'base64', function(err) {
                    if (err) {
                      var result = {
                          error: true,
                          extractedText: "Error Occured while processing your request. Please Try again later."
                      }
                      client.emit('messages', result);
                      reject(err);
                      //console.log("filemoved error")

                    } else {
                      //console.log("filemoved successfullt")
                        resolve(filename);
                    }
                })


            }).then(function(name) {
                //console.log("uploader   " + name);
                uploader.upload({
                    fileId: 'someUniqueIdentifier',
                    bucket: 'cloudadic/ocr/uploads',
                    source: __dirname + '/public/image/' + name,
                    name: name
                }, function(data) {
                    //console.log('uploaded succ ' + JSON.stringify(data));
                    require("fs").unlink(__dirname + '/public/image/' + name, function(err) {
                        if (err) return console.log(err);
                        //console.log('file deleted successfully');
                    });
                    var s3path = "https://s3.amazonaws.com/cloudadic/ocr/uploads/" + name;
                    var pyCmd = 'cd receiptbot && python2 hello.py ' + s3path;
                    exec(pyCmd, {
                        user: 'ubuntu',
                        host: 'ec2-52-202-254-92.compute-1.amazonaws.com',
                        key: myKeyFileOrBuffer
                        //password: ''
                    }, function(err, stdout, stderr) {
                        //console.log(err + stdout+ stderr)
                      //console.log("received data " + stdout);
                        //console.log("received err "+ err);
                      //console.log("received stderr "+ stderr);
                        var result = {
                            error: false,
                            extractedText: stdout
                        }
                        client.emit('messages', result);

                    })
                }, function(errMsg, errObject) { //error
                    console.error('unable to upload: ' + errMsg + ':', errObject);
                    var result = {
                        error: true,
                        extractedText: "Error Occured while processing your request. Please Try again later."
                    }
                    client.emit('messages', result);
                })


            })
        } else {
            var result = {
                error: true,
                extractedText: "Error Occured while processing your request. Please Try again later."
            }
            client.emit('messages', result);
        }
    })

});
server.listen(process.env.PORT || 86, process.env.IP || "0.0.0.0", function() {
    console.log("Server started");

});
