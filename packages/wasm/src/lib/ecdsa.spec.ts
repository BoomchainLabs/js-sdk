/// <reference types="jest" />

import { ethers } from 'ethers';
import {
  messageHex,
  presignatureHex,
  publicKeyHex,
  signatureHex,
  signatureSharesHex,
} from './ecdsa-data.spec.json';
import { ecdsaCombine, ecdsaVerify, ecdsaDeriveKey } from '..';

const publicKey = Buffer.from(publicKeyHex, 'hex');
const uncompressedPublicKey = ethers.utils.computePublicKey(publicKey);
const presignature = Buffer.from(presignatureHex, 'hex');
const signatureShares = signatureSharesHex.map((s) => Buffer.from(s, 'hex'));
const message = Buffer.from(messageHex, 'hex');

const signature = {
  r: Buffer.from(signatureHex.r, 'hex'),
  s: Buffer.from(signatureHex.s, 'hex'),
  v: signatureHex.v,
};

describe('ECDSA', () => {
  it('should combine signatures', async () => {
    const [r, s, v] = await ecdsaCombine('K256', presignature, signatureShares);
    expect(r).toBeInstanceOf(Uint8Array);
    expect(s).toBeInstanceOf(Uint8Array);
    expect(v === 0 || v === 1).toBeTruthy();

    expect(Buffer.from(r)).toEqual(signature.r);
    expect(Buffer.from(s)).toEqual(signature.s);
    expect(v).toEqual(signature.v);
  });

  it('should generate valid signatures for ethers', () => {
    expect(
      ethers.utils.recoverPublicKey(
        message,
        Buffer.concat([signature.r, signature.s, Buffer.from([signature.v])])
      )
    ).toEqual(uncompressedPublicKey);
  });

  it('should verify signature', async () => {
    await ecdsaVerify('K256', message, publicKey, [
      signature.r,
      signature.s,
      signature.v,
    ]);
  });

  it('should derive keys', async () => {
    const identity = Buffer.from('test', 'ascii');
    const derivedKey = await ecdsaDeriveKey('K256', identity, [
      publicKey,
      publicKey,
    ]);

    expect(derivedKey).toBeInstanceOf(Uint8Array);
    expect(Buffer.from(derivedKey)).toEqual(
      Buffer.from(
        '0440b3dc3caa60584ad1297bc843075b30b04139bcc438a04401ed45d78526faac7fe86c033f34cac09959e1b7ad6e940028e0ed26277f5da454f9432ba7a02a8d',
        'hex'
      )
    );
  });
});
