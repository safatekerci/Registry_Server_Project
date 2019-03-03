var fs = require("fs");
var jsdiff = require('diff');
var fileFirst = "";
var fileLast = "";
var readable = fs.createReadStream(__dirname + '\\RegistryBackUpFirst\\HCCBackupFirst.txt', {
    encoding: 'utf8',
    highWaterMark: 20 * 1024 * 1024
});

readable.on('data', function (chunk) {
    fileFirst = chunk;
});
var readable2 = fs.createReadStream(__dirname + '\\RegistryBackUpLast\\HCCBackupLast.txt', {
    encoding: 'utf8',
    highWaterMark: 20 * 1024 * 1024
});

readable2.on('data', function (chunk) {
    fileLast = chunk;
});
var diff = jsdiff.diffSentences(fileFirst, fileLast);
diff.forEach(function (part) {
    process.stderr.write(part.value);
});
/*var StringDecoder = require('string_decoder').StringDecoder;

fs.readFile("RegistryBackUpFirst\\HLMBackuFirstp.txt", function (err, fileFirst) {
    if (err) console.log(err);
    else {
        //var fileFirst = data.toString();
        var fileLast = "";
        fs.readFile("RegistryBackUpLast\\HLMBackupLast.txt", function (err, fileLast) {
            if (err) console.log(err);
            //fileLast = data.toString();
            //fileLast = decoder.write(data);
        });
        var diff = jsdiff.diffLines(fileFirst.toString(), fileLast.toString());
        diff.forEach(function (part) {
            process.stderr.write(part.value);
        });
    }
});*/