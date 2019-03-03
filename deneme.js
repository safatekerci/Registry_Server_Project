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


for (var i = 0; i < backUpNamesFirst.length; i++) {
    console.log('İçerdeyim')
    fs.unlink('./REGISTRYBACKUPFIRST/' + backUpNamesFirst[i], function (err) {
        console.log("BackUpFirst => " + backUpNamesFirst[i] + ' dosyası silindi.');
    });

    fs.unlink('./REGISTRYBACKUPLAST/' + backUpNamesLast[i], function (err) {
        console.log("BackUpFirs => " + backUpNamesFirst[i] + ' dosyası silindi.');
    });
}