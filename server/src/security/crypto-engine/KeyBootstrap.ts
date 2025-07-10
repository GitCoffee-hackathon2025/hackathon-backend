// import generateKeys from '../../config/rsa';
// import KeyManager from './KeyManager';

// class KeyBootstrap extends KeyManager {
//   private static time = 604800000;

//   private static _initCalled = false;

//   public static async init(): Promise<boolean> {
//     try {
//       if (this._initCalled) throw new Error('not allowed to restart');
//       this._initCalled = true;

//       const createKeys = async () => {
//         const newPair = await generateKeys('crypto');

//         if (KeyManager.keys.private != KeyManager.keys.old)
//           KeyManager.keys.old = KeyManager.keys.private;

//         KeyManager.keys.public = newPair.public;
//         KeyManager.keys.private = newPair.private;

//         setTimeout(async () => await createKeys(), this.time);
//       };
//       await createKeys();
//       return true;
//     } catch (err) {
//       return false;
//     }
//   }
// }

// export default KeyBootstrap;
