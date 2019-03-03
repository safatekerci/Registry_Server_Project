var cmd = require('node-cmd');
backUpNamesFirst = ['HCRBACKUPFIRST.TXT', 'HCUBACKUPFIRST.TXT', 'HLMBACKUPFIRST.TXT', 'HUBACKUPFIRST.TXT', 'HCCBACKUPFIRST.TXT'];
backUpNamesLast = ['HCRBBACKUPLAST.TXT', 'HCUBACKUPLAST.TXT', 'HLMBACKUPLAST.TXT', 'HUBACKUPLAST.TXT', 'HCCBACKUPLAST.TXT'];
pathFirst = 'REGISTRYBACKUPFIRST\\';
pathLast = 'REGISTRYBACKUPLAST\\';

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

findDifference();
files = ['HKEY_CLASSES_ROOT', 'HKEY_CURRENT_USER', 'HKEY_LOCAL_MACHINE', 'HKEY_USERS', 'HKEY_CURRENT_CONFIG'];
function findDifference() {
    var dataSplit;
    for (var i = 0; i < backUpNamesFirst.length; i++) {
        (function (i) {
            cmd.get('fc /U /W /T ' + 'RegistryBackUpFirst\\' + backUpNamesFirst[i] + ' ' + 'RegistryBackUpLast\\' + backUpNamesLast[i], function (err, data) {
                dataSplit = data.split('\n');
                dataParse(dataSplit, i);
            });
        })(i);
    }
};

function dataParse(dataSplit, index) {
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
        result.deletedResults[files[index]] = resultDeleted;
        result.insertedResults[files[index]] = resultInserted;
        //result["deletedResults"] = resultDeleted;
        //result["insertedResults"] = resultInserted;
        console.log('--------------------------------------' + files[index] + '--------------------------------------------------------------')
        console.log('Eklenen veriler\n', result.insertedResults[files[index]]);
        console.log('Silinen Veriler\n', result.deletedResults[files[index]]);
        console.log('---------------------------------------------------------------------------------------------------------------')

    }
}
