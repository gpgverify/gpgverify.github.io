//keyserverURL = "http://subset.pool.sks-keyservers.net"
keyserverURL = 'https://sks.disunitedstates.com'

function parse_url() {
    signature = window.location.href.split(/#(.+)?/)[1];
    if (typeof signature === 'undefined') {
        return false;
    }

    document.getElementById("signature").value = signature;
}

function verify_signature(signature) {
    sig = openpgp.cleartext.readArmored(signature);
    identity = "0x" + sig.getSigningKeyIds()[0].toHex();

    var key = openhkp.op_get(keyserverURL, identity, 0);
    keys = openpgp.key.readArmored(key);
    key = keys.keys[0];

    if (key.verifyPrimaryKey() != openpgp.enums.keyStatus.valid) {
        alert("Invalid key!");
        return;
    }

        var verified = sig.verify(keys.keys);
    if (!verified || verified.length <= 0 || !verified[0].valid) {
        alert("Verifying signature: FAILED!");
        return;
    }

    var identities = '';
    key.users.forEach(function(user) {
        identities += user.userId.userid + "\n";
    });

    fingerprint = key.primaryKey.fingerprint;
    alert("VALID signature from\n\n" + identities + "\n(0x" + fingerprint + ")");
    return true;
}
