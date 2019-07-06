const {
    Account,
    Address,
    Deadline,
    Mosaic,
    MosaicId,
    NetworkType,
    PlainMessage,
    TransactionHttp,
    TransferTransaction,
    UInt64
} = require('nem2-sdk');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const privateKey = process.env.PRIVATE_KEY;
    const networkType = NetworkType[process.env.NETWORK_TYPE];
    const endpoint = process.env.ENDPOINT;
    const mosaicId = new MosaicId(process.env.MOSAIC_ID);
    const amount = UInt64.fromUint(process.env.AMOUNT);
    const fee = UInt64.fromUint(process.env.FEE);

    const account = Account.createFromPrivateKey(privateKey, networkType);

    if (req.query.recipient || (req.body && req.body.recipient)) {
        const recipient = Address.createFromRawAddress(req.query.recipient || req.body.recipient);
        const transactionHttp = new TransactionHttp(endpoint);
        const tx = TransferTransaction.create(
            Deadline.create(),
            recipient,
            [new Mosaic(mosaicId, amount)],
            PlainMessage.create(''),
            networkType,
            fee
        );
        const signedTx = account.sign(tx);
        await transactionHttp.announce(signedTx).toPromise().then(() => {
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: signedTx.hash
            };
        }).catch(() => {
            context.res = {
                status: 500,
                body: "Transaction annoucne fail"
            };
        })
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a recipient on the query string or in the request body"
        };
    }
};