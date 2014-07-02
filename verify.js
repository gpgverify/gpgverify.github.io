//keyserverURL = "http://subset.pool.sks-keyservers.net"
keyserverURL = 'https://sks.disunitedstates.com'

function verify_signature(identity, signature) {

    var key = openhkp.op_get(keyserverURL, identity, 0);
    keys = openpgp.key.readArmored(key);
    key = keys.keys[0];

    if (key.verifyPrimaryKey() != openpgp.enums.keyStatus.valid) {
        alert("Invalid key!");
        return;
    }

    sig = openpgp.cleartext.readArmored(signature);
    var verified = sig.verify(keys.keys);
    if (!verified || verified.length <= 0 || !verified[0].valid) {
        alert("Verifying signature: FAILED!");
        return;
    }

    var identities = '';
    key.users.forEach(function(user) {
        identities += user.userId.userid + "\n";
    });

    alert("VALID signature from\n\n" + identities);
    return true;
}

