import { PrivateKey } from 'symbol-sdk';
import { SymbolFacade, descriptors, models } from 'symbol-sdk/symbol';

const facade = new SymbolFacade('testnet');


async function run() {
    console.log("開始");
    await new Promise(res => setTimeout(res, 1000));
    console.log("完了！");
}
run().then(() => console.log("終了"));