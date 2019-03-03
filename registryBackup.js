var cmd = require('node-cmd');
backUpNamesFirst = ['HCRBACKUPFIRST.TXT', 'HCUBACKUPFIRST.TXT', 'HLMBACKUPFIRST.TXT', 'HUBACKUPFIRST.TXT', 'HCCBACKUPFIRST.TXT'];
backUpNamesLast = ['HCRBBACKUPLAST.TXT', 'HCUBACKUPLAST.TXT', 'HLMBACKUPLAST.TXT', 'HUBACKUPLAST.TXT', 'HCCBACKUPLAST.TXT'];
pathFirst = 'REGISTRYBACKUPFIRST\\';
pathLast = 'REGISTRYBACKUPLAST\\';

getAllRegistryBackUp(pathLast,backUpNamesLast);

function getAllRegistryBackUp(path, backUpNames) {

    files = ['HKEY_CLASSES_ROOT', 'HKEY_CURRENT_USER', 'HKEY_LOCAL_MACHINE', 'HKEY_USERS', 'HKEY_CURRENT_CONFIG'];
    for (var i = 0; i < files.length; i++) {
        getRegistryBackUP(files[i], path + backUpNames[i]);
    };

    //İstenilen registry deki doyanın backUp'nı alır
    function getRegistryBackUP(file, path) {
        cmd.get('reg export ' + file + ' ' + path, function (err, data, stderr) {
            if (err) { console.log(err); }
        });
    };
};