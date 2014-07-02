// var keyserverURL = "http://subset.pool.sks-keyservers.net";
var keyserverURL = 'https://sks.disunitedstates.com';

function parse_url() {
    var signature = window.location.href.split(/#(.+)?/)[1];
    if (typeof signature === 'undefined') {
        return false;
    }

    document.getElementById("signature").value = signature;
    get_signature(process_signature);
}

function get_signature(callback) {
    signature = document.getElementById("signature").value;

    if (signature.lastIndexOf('http', 0) !== 0) {
        callback(signature);
    }

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            callback(xmlhttp.responseText);
        }
    }

    xmlhttp.open("GET", 'https://sameorigin.herokuapp.com/?' + signature, true);
    xmlhttp.send();
}

function process_signature(signature) {
    document.getElementById("signature").value = signature;
    return verify_signature(signature);
}

function verify_signature(signature) {
    var sig = openpgp.cleartext.readArmored(signature);
    var identity = "0x" + sig.getSigningKeyIds()[0].toHex();

    var found_key = openhkp.op_get(keyserverURL, identity, 0);
    var keys = openpgp.key.readArmored(found_key);
    var key = keys.keys[0];

    if (key.verifyPrimaryKey() != openpgp.enums.keyStatus.valid) {
        alert("Invalid key!");
        return false;
    }

    var verified = sig.verify(keys.keys);
    if (!verified || verified.length <= 0 || !verified[0].valid) {
        alert("Verifying signature: FAILED!");
        return false;
    }

    var identities = '';
    key.users.forEach(function(user) {
        identities += user.userId.userid + "\n";
    });

    var fingerprint = key.primaryKey.fingerprint;
    alert("VALID signature from\n\n" + identities + "\n(0x" + fingerprint + ")");
    return true;
}
