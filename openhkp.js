/*
 * Author: Dennis Guse <dennis.guse@alumni.tu-berlin.de>
 * License: GPLv2+
 * 
 * Implementation of the HKP protocol to query PGP keyservers.
 *
 * http://tools.ietf.org/html/draft-shaw-openpgp-hkp-00
 */

/*
TODO:
* Check passed parameters for additional parameters!
* Write tests!
* Write DOC!
* CHECK constraints (no logging of data)
*/

var openhkp = new function() {

    var NetworkException = function() {};
    var KeyserverURLinvalidException = function() {};
    var ServerUnknownErrorException = function() {};
    var ServerUnsupportedQueryException = function() {};

    var InvalidParameterException = function() {};

    var KeyNotFoundException = function() {};
    var SearchNotSetException = function() {};
    
    var PubParsingException = function() {};
    var UIDParsingException = function() {};
    var IndexParsingException = function() {};
        
	this.op_get = function(keyserverURL, search, exact) {
	    console.debug("openHKP.js::op_get: got called")
	    isKeyserverURLvalid(keyserverURL);
	    
        if (typeof search === 'undefined') {
       	    console.error("openHKP.js::op_get: search not defined.")
            throw new SearchNotSetException();
        }
		if (typeof exact !== 'undefined' && !exact) {
			var BASE_URL = "/pks/lookup?op=get&option=mr&exact=on&search=";
		} else {
			var BASE_URL = "/pks/lookup?op=get&options=mr&exact=off&search=";
		}

        request_url = keyserverURL + BASE_URL;
		console.debug("openHKP.js::op_get: requestURL (search parameter not shown). " + request_url);

        request = new XMLHttpRequest();
        try {
	    	request.open("GET", request_url + encodeURIComponent(search), false);
	    	request.send();
	    } catch(exception) {
	    	console.error("openHKP.js::op_get: Got (probably) a network error %s.", exception)
	        throw new NetworkException();
	    }

  		switch (request.status) {
  		    case 200:
      		    break;
            case 404:
            	console.error("openHKP.js::op_get: no key found.")
                throw new KeyNotFoundException();
                break;
			case 501:
            	console.error("openHKP.js::op_get: query not supported by PGP-Keyserver.")
			    throw new ServerUnsupportedQueryException();
			    break;
		    default:
               	console.error("openHKP.js::op_get: Unknown error code %i.", request.status)
			    throw new ServerUnknownErrorException();
                break;		        
		}
        
        console.info("openHKP.js::op_get: return found key(s).")
        return request.response;
	};

	this.op_vindex = function(keyserverURL, search, fingerprint) {
	    console.debug("openHKP.js::op_vindex: got called")
  	    isKeyserverURLvalid(keyserverURL);
	    
        if (typeof search === 'undefined') {
       	    console.error("openHKP.js::op_vindex: search not defined.")
            throw new SearchNotSetException();
        }
		if (typeof fingerprint !== 'undefined' && !fingerprint) {
			var BASE_URL = "/pks/lookup?op=vindex&option=mr&fingerprint=on&search=";
		} else {
			var BASE_URL = "/pks/lookup?op=vindex&options=mr&fingerprint=off&search=";
		}

        var request_url = keyserverURL + BASE_URL;
		console.debug("openHKP.js::op_vindex: requestURL (search parameter not shown)" + request_url);

        var request = new XMLHttpRequest();
        try {
	    	request.open("GET", request_url + encodeURIComponent(search), false);
	    	request.send();
	    } catch(exception) {
	    	console.error("openHKP.js::op_vindex: Got (probably) a network error %s.", exception)
	        throw new NetworkException();
	    }

  		switch (request.status) {
  		    case 200:
  		        break;
            case 404:
            	console.error("openHKP.js::op_vindex: no key found.")
                throw new KeyNotFoundException();
                break;
            case 500:
            	console.error("openHKP.js::op_vindex: either no match or too many.")
            	throw new ServerE
			case 501:
            	console.error("openHKP.js::op_vindex: query not supported by PGP-Keyserver.")
			    throw new ServerUnsupportedQueryException();
			    break;
		    default:
               	console.error("openHKP.js::op_vindex: Unknown error code %i.", request.status)
			    throw new ServerUnknownErrorException();
                break;		        

		}
        
        console.info("openHKP.js::op_vindex: return found key(s).")
        return request.response; //TODO Check result?
	};

	this.op_index = function(keyserverURL, search, fingerprint) {
		return this.op_vindex(keyserverURL, search, fingerprint);
	};
	
	this.submit = function(keyserverURL, keytext) {
	    console.debug("openHKP.js::submit: got called")
   	    isKeyserverURLvalid(keyserverURL);
	    
        if (typeof keytext !== 'string') {
       	    console.error("openHKP.js::submit: keytext not defined.")
            throw new InvalidParameterException();
        }

        var request_url = keyserverURL + "/pks/add";
		console.debug("openHKP.js::submit: requestURL (keytext parameter not shown)" + request_url);
        var request = new XMLHttpRequest();
        try {    
	    	request.open("POST", request_url, false);
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
            request.send("keytext=" + encodeURIComponent(keytext));

//          Multipart/form-data might be the better choice, but keyserver.ubuntu.com cannot cope with it.
//          Others not tested.
/*	    	request.open("POST", request_url, false);
	    	request.setRequestHeader("Content-Type", "multipart/form-data");
            var data = new FormData();
            data.append("keytext", keytext);
	    	request.send(data);
*/
	    } catch(exception) {
	    	console.error("openHKP.js::submit: Got (probably) a network error %s.", exception)
	        throw new NetworkException();
	    }

  		switch (request.status) {
  		    case 200:
  		        break;
            case 403:
            	console.error("openHKP.js::submit: not allowed.")
                throw new KeyNotFoundException();
                break;
			case 500:
            	console.error("openHKP.js::submit: server error (check submitted data).")
			    throw new ServerUnsupportedQueryException();
			    break;
			case 501:
            	console.error("openHKP.js::submit: submission not supported by PGP-Keyserver.")
			    throw new ServerUnsupportedQueryException();
			    break;
		    default:
               	console.error("openHKP.js::submit: Unknown error code %i.", request.status)
			    throw new ServerUnknownErrorException();
                break;		        

		}
        
	}

    //Functions to parse op_vindex response
	this.parse_vindex_response = function(response) {	    
        if (typeof response !== 'string') {
	        console.error("openHKP.js::parse_vindex_message: no message to parse (1).");
	        throw new IndexParsingException();
	    }
        var pub_array = response.split("pub:");
	    var pub_array_idx = 0;
	    
	    //Parse header
	    var header = []; //TODO Make object?
        if (pub_array[0].indexOf("info") == 0) {
   	        header = pub_array[0].split(":");
   	        if (header.length != 3) {
    	        console.error("openHKP.js::parse_vindex_message: header is broken.");
    	        throw new IndexParsingException();
   	        }
   	        pub_array_idx = 1;
   	        console.debug("openHKP.js::parse_vindex_message: found header with 3 items.");
    	}
        var parsed_keys_array = [];
        //Parse Keys
        for(pub_array_idx; pub_array_idx < pub_array.length; pub_array_idx++) {
            var key = new PublicKeyIndex("pub:" + pub_array[pub_array_idx]); //Re-insert delimiter removed by split.
            parsed_keys_array[parsed_keys_array.length] = key;
        }
        return parsed_keys_array;
	}
	
    //pub:<keyid>:<algo>:<keylen>:<creationdate>:<expirationdate>:<flags>	
    //uid...
    //uid...
    var PublicKeyIndex = function(pubkeystring) {
        if (typeof pubkeystring !== 'string') {
        	console.error("openHKP.js::PublicKeyIndex: no pubkey to parse (1).");
	        throw new PubParsingException();
	    }
	    
	    var uid_array = pubkeystring.split("uid:");
	    var uid_array_idx = 0;

        //Parse pubkey
        var pub_line = uid_array[0].split(":");
        if (pub_line[0].indexOf("pub") != 0 || pub_line.length != 7) {
   	        console.error("openHKP.js::PublicKeyIndex: pub: is broken.");
   	        throw new PubParsingException();
        }
        
        //TODO Check content!
        this.keyid = pub_line[1];
        this.algo = pub_line[2];
        this.keylen = pub_line[3];
        this.creationdate = pub_line[4];
        this.expirationdate = pub_line[5];
        this.flags = pub_line[6];
        //TODO Create getter and parse also flags! and parse date! and so on!!       
        
        //Parse uid
        this.uid = [];
        for(uid_array_idx = 1; uid_array_idx < uid_array.length; uid_array_idx++) {
            var parsed_uid = new UIDIndex("uid:" + uid_array[uid_array_idx]); //Re-insert delimiter removed by split.
            this.uid[uid_array_idx] = parsed_uid;
        }
        
        this.toString = function() {
            return JSON.stringify(this);
        }
    }
    
    //uid:<escaped uid string>:<creationdate>:<expirationdate>:<flags>
    var UIDIndex = function(uidstring) {
        if (typeof uidstring !== 'string') {
        	console.error("openHKP.js::UIDIndex: no pubkey to parse (1).");
	        throw new UIDParsingException();
	    }

        //Parse uid line
        uid_line = uidstring.split(":");
        if (uid_line[0].indexOf("uid") != 0 || uid_line.length != 5) {
   	        console.error("openHKP.js::UIDIndex: pub: is broken.");
   	        throw new UIDParsingException();
        }
        
        //TODO Check content!
        this.uid = uid_line[1];
        this.creationdate = uid_line[2];
        this.expirationdate = uid_line[3];
        this.flags = uid_line[4];
    }
    
    var isKeyserverURLvalid = function(keyserverURL) {
        return;
        if (typeof uidstring !== 'string') {
              if (/^(http|https):\/\/[\w\d\.\_\-]*(:\d{1,5})?\/[\w\d\.\_\-\/]*$/.test(keyserverURL)) return
        }
        throw new KeyserverURLinvalidException();
    }
};
