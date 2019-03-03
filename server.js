//server.js
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dl = require('delivery');
var fs = require('fs');
var formidable = require('formidable');
var spawn = require('child_process').spawn;
var cmd = require('node-cmd');

backUpNamesFirst = ['HCRBACKUPFIRST.TXT', 'HCUBACKUPFIRST.TXT', 'HLMBACKUPFIRST.TXT', 'HUBACKUPFIRST.TXT', 'HCCBACKUPFIRST.TXT'];
backUpNamesLast = ['HCRBBACKUPLAST.TXT', 'HCUBACKUPLAST.TXT', 'HLMBACKUPLAST.TXT', 'HUBACKUPLAST.TXT', 'HCCBACKUPLAST.TXT'];
pathFirst = 'REGISTRYBACKUPFIRST\\';
pathLast = 'REGISTRYBACKUPLAST\\';

var exportFilesCount = 0;

var result = {
    deletedResults: {
        HKEY_CLASSES_ROOT: "",
        HKEY_CURRENT_USER: "",
        HKEY_LOCAL_MACHINE: "",
        HKEY_USERS: "",
        HKEY_CURRENT_CONFIG: ""
    },
    insertedResults: {
        HKEY_CLASSES_ROOT: "",
        HKEY_CURRENT_USER: "",
        HKEY_LOCAL_MACHINE: "",
        HKEY_USERS: "",
        HKEY_CURRENT_CONFIG: ""
    }
};
//Dosyalar arasındaki farkı getirir
var parseFilesCount = 0;
var findDifference = function (lambda) {
    var dataSplit;
    for (var i = 0; i < backUpNamesFirst.length; i++) {
        (function (i) {
            cmd.get('fc /U /W /T ' + 'REGISTRYBACKUPFIRST\\' + backUpNamesFirst[i] + ' ' + 'REGISTRYBACKUPLAST\\' + backUpNamesLast[i], function (err, data) {
                dataSplit = data.split('\n');
                dataParse(dataSplit, i);
                if (parseFilesCount == backUpNamesFirst.length) {
                    lambda(result);
                    parseFilesCount = 0;
                }
            });
        })(i);
    }
};
//Compare sonuçlarını parse eder
function dataParse(dataSplit, index) {
    files = ['HKEY_CLASSES_ROOT', 'HKEY_CURRENT_USER', 'HKEY_LOCAL_MACHINE', 'HKEY_USERS', 'HKEY_CURRENT_CONFIG'];
    var control = "No";
    var resultDeleted = "", resultInserted = "";
    if (dataSplit.length > 2) {
        //silinen verileri getirir
        for (var j = 0; j < dataSplit.length; j++) {
            if (dataSplit[j].trim() == "***** REGISTRYBACKUPFIRST\\" + backUpNamesFirst[index]) {
                control = "Yes";
                j++;
            }
            if (dataSplit[j].trim() == "***** REGISTRYBACKUPLAST\\" + backUpNamesLast[index]) {
                control = "No";
            }

            if (control == "Yes") {
                resultDeleted = resultDeleted + dataSplit[j].trim() + '\n';
            }
        }
        //Eklenmiş verileri getirir
        for (var h = 0; h < dataSplit.length; h++) {
            if (dataSplit[h].trim() == "***** REGISTRYBACKUPLAST\\" + backUpNamesLast[index]) {
                control = "Yes";
                h++;
            }
            if (dataSplit[h].trim() == "*****") {
                control = "No";
            }

            if (control == "Yes") {
                resultInserted = resultInserted + dataSplit[h].trim() + '\n';
            }
        }
        if (files[index] == "HKEY_CLASSES_ROOT") {
            result.deletedResults.HKEY_CLASSES_ROOT = resultDeleted;
            result.insertedResults.HKEY_CLASSES_ROOT = resultInserted;
        }
        else if (files[index] == "HKEY_CURRENT_USER") {
            result.deletedResults.HKEY_CURRENT_USER = resultDeleted;
            result.insertedResults.HKEY_CURRENT_USER = resultInserted;
        }
        else if (files[index] == "HKEY_LOCAL_MACHINE") {
            result.deletedResults.HKEY_LOCAL_MACHINE = resultDeleted;
            result.insertedResults.HKEY_LOCAL_MACHINE = resultInserted;
        }
        else if (files[index] == "HKEY_USERS") {
            result.deletedResults.HKEY_USERS = resultDeleted;
            result.insertedResults.HKEY_USERS = resultInserted;
        }
        else if (files[index] == "HKEY_CURRENT_CONFIG") {
            result.deletedResults.HKEY_CURRENT_CONFIG = resultDeleted;
            result.insertedResults.HKEY_CURRENT_CONFIG = resultInserted;
        }
        parseFilesCount = parseFilesCount + 1;
    }
};
//Registry Backup alır
var getAllRegistryBackUp = function (path, backUpNames, lambda) {
    files = ['HKEY_CLASSES_ROOT', 'HKEY_CURRENT_USER', 'HKEY_LOCAL_MACHINE', 'HKEY_USERS', 'HKEY_CURRENT_CONFIG'];
    for (var i = 0; i < files.length; i++) {
        (function (i) {
            var command = spawn(process.env.comspec, ['/c', 'REG EXPORT ' + files[i] + ' ' + path + backUpNames[i]]);
            command.on('close', function (code) {
                exportFilesCount = exportFilesCount + 1;
                console.log(exportFilesCount);
                if (exportFilesCount == 5) {
                    lambda('Success');
                    exportFilesCount = 0;
                }
            });
        })(i);
    };
};

// supervisor tarafında bir socket açtık..
io.sockets.on('connection', function (socket) {
    // web serverı  dinle...
    var delivery = dl.listen(socket);
    // alma işlemi başarılıysa...
    delivery.on('receive.success', function (file) {

        fs.writeFile('./receivefiles/' + file.name, file.buffer, function (err) {
            if (err) {
                console.log('Physical_Machine => Dosya kaydedilemedi !!! : ' + err);
                io.sockets.emit('scanResult', "scanError");
            }
            else {
                console.log('Physical_Machine => ' + file.name + " dosyası başarıyla kaydedildi...");
                getAllRegistryBackUp(pathFirst, backUpNamesFirst, data => {
                    if (data == 'Success') {
                        console.log('Firstbackup lar alındı');
                        var command = spawn(process.env.comspec, ['/c', 'C:\\Users\\safa\\Desktop\\Registry\\receivefiles\\' + file.name]);
                        setTimeout(function () {
                            command.kill();
                            console.log('Dosya Çalıştırıldı');
                            getAllRegistryBackUp(pathLast, backUpNamesLast, data => {
                                if (data == 'Success') {
                                    console.log('Lastbackup lar alındı');
                                    findDifference(data => {
                                        //Result emit edilecek
                                        console.log(data);
                                        io.sockets.emit('registryResult', data);
                                        //yüklenen dosya silindi
                                        fs.unlink('./receivefiles/' + file.name, function (err) {
                                            console.log("Physical_Machine => " + file.name + ' dosyası silindi.');
                                        });
                                        //BackUplar silinecek
                                        console.log('Dosyalar silinecek');
                                        for (var i = 0; i < backUpNamesFirst.length; i++) {
                                            (function (i) {
                                                fs.unlink('./REGISTRYBACKUPFIRST/' + backUpNamesFirst[i], function (err) {
                                                    console.log("BackUpFirs => " + backUpNamesFirst[i] + ' dosyası silindi.');
                                                });

                                                fs.unlink('./REGISTRYBACKUPLAST/' + backUpNamesLast[i], function (err) {
                                                    console.log("BackUpFirs => " + backUpNamesFirst[i] + ' dosyası silindi.');
                                                });
                                            })(i);
                                        }
                                    });
                                }
                            });
                        },20000)
                    }
                });



            };
        });


    });
});

// portu dinle...
http.listen(5001, function () {
    console.log('Physical_Machine => 5001. port dinleniyor..');
});
