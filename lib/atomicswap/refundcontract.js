'use strict';

var _ = require('lodash');
var $ = require('../util/preconditions');
var errors = require('../errors');
var JSUtil = require('../util/js');
var PublicKey = require('../publickey');
var Opcode = require('../opcode');
var BufferReader = require('../encoding/bufferreader');
var Address = require('../address');
var Signature = require('../crypto/signature');
var AuditContract = require('./auditcontract');

function RefundContract(contract, sigAndPubkey) {
  if (!(this instanceof RefundContract)) {
    return new RefundContract(contract, sigAndPubkey);
  }

  if(!JSUtil.isHexa(sigAndPubkey)) {
    throw new TypeError('sigAndPubKey must be string for hex');
  }

  let s1 = new Script(sigAndPubkey);
  if( s1.chunks.length != 2){
    throw new TypeError('sigAndPubkey is invalid');
  }

  let sig = s1.chunks[0].buf.toString('hex');
  let signature = Signature.fromString(sig.substring(0,sig.length-2));
  if(signature.isTxDER){
    throw new TypeError('sig is invalid');
  }

  let pubkey = s1.chunks[1].buf.toString('hex');
  let publicKey = new PublicKey(pubkey);

  let cnt = AuditContract(contract);

  if(!cnt.isAtomicSwap){
    throw new TypeError('contract is invalid');
  }

  let s = new Script();
  s.add(Buffer.from(sig, 'hex'));
  s.add(Buffer.from(pubkey, 'hex'));
  s.add(Opcode.OP_0);
  s.add(Buffer.from(contract, 'hex'));

  this.script = s;
  // let hexStr =  s.toHex();
  // this.hex = (hexStr.length/2).toString('16') + s.toHex();
  this.hex = s.toHex();
  return this;
}

module.exports = RefundContract

var Script = require('../script');
