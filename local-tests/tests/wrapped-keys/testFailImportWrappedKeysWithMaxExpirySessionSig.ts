import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';
import { api } from '@lit-protocol/wrapped-keys';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';
import { randomSolanaPrivateKey } from 'local-tests/setup/tinny-utils';

const { importPrivateKey } = api;

/**
 * Test Commands:
 * ✅ NETWORK=datil-dev yarn test:local --filter=testFailImportWrappedKeysWithMaxExpirySessionSig
 * ✅ NETWORK=datil-test yarn test:local --filter=testFailImportWrappedKeysWithMaxExpirySessionSig
 * ✅ NETWORK=custom yarn test:local --filter=testFailImportWrappedKeysWithMaxExpirySessionSig
 */
export const testFailImportWrappedKeysWithMaxExpirySessionSig = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  try {
    const pkpSessionSigs = await getPkpSessionSigs(devEnv, alice);

    try {
      const privateKey = randomSolanaPrivateKey();

      await importPrivateKey({
        pkpSessionSigs,
        privateKey,
        litNodeClient: devEnv.litNodeClient,
        publicKey: '0xdeadbeef',
        keyType: 'K256',
        memo: 'Test key',
      });
    } catch (e: any) {
      if (e.message.includes('Expires too far in the future')) {
        console.log('✅ THIS IS EXPECTED: ', e);
        console.log(e.message);
        console.log(
          '✅ testFailImportWrappedKeysWithMaxExpirySessionSig is expected to have an error'
        );
      } else {
        throw e;
      }
    }

    console.log('✅ testFailImportWrappedKeysWithMaxExpirySessionSig');
  } finally {
    devEnv.releasePrivateKeyFromUser(alice);
  }
};
