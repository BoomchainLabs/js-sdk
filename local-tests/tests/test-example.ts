import { getEoaSessionSigs } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { getLitActionSessionSigs } from 'local-tests/setup/session-sigs/get-lit-action-session-sigs';
import { getPkpSessionSigs } from 'local-tests/setup/session-sigs/get-pkp-session-sigs';

import { LIT_NETWORK } from '@lit-protocol/constants';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

export const testExample = async (devEnv: TinnyEnvironment) => {
  // Note: This test will be skipped if we are testing on the DatilDev network
  devEnv.setUnavailable(LIT_NETWORK.DatilDev);

  const alice = await devEnv.createRandomPerson();

  const aliceEoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

  const aliceExecuteJsRes = await devEnv.litNodeClient.executeJs({
    sessionSigs: aliceEoaSessionSigs,
    code: `(async () => {
      const sigShare = await LitActions.signEcdsa({
        toSign: dataToSign,
        publicKey,
        sigName: "sig",
      });
    })();`,
    jsParams: {
      dataToSign: alice.loveLetter,
      publicKey: alice.pkp.publicKey,
    },
  });

  console.log('aliceExecuteJsRes:', aliceExecuteJsRes);

  devEnv.releasePrivateKeyFromUser(alice);

  // console.log('aliceEoaSessionSigs: ', aliceEoaSessionSigs);

  // const alicePkpSessionSigs = await getPkpSessionSigs(devEnv, alice);
  // console.log('alicePkpSessionSigs: ', alicePkpSessionSigs);

  // const aliceLitActionSessionSigs = await getLitActionSessionSigs(
  //   devEnv,
  //   alice
  // );
  // console.log('aliceLitActionSessionSigs: ', aliceLitActionSessionSigs);
};
