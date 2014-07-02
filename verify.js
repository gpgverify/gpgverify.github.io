//keyserverURL = "http://subset.pool.sks-keyservers.net"
keyserverURL = 'https://sks.disunitedstates.com'

function verify_signature(identity, signature) {

    var key = openhkp.op_get(keyserverURL, identity, 0);
    keys = openpgp.key.readArmored(key);
    key = keys.keys[0];
    user = key.getPrimaryUser();
    key.verifyPrimaryKey() == openpgp.enums.keyStatus.valid;

    sig = openpgp.cleartext.readArmored(signature);
    var verified = sig.verify(keys.keys);
    if (!verified || verified.length <= 0 || !verified[0].valid) {
      alert("Verifying signature: FAILED!");
      return;
    }
    alert("Verifying signature: OK!");

    return true;
}

