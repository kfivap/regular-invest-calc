import yahooFinance from 'yahoo-finance2'; 

import fs from 'fs'
import path from 'path'
import { HistoricalHistoryResult } from 'yahoo-finance2/dist/esm/src/modules/historical';
import { BigNumber } from 'bignumber.js'

const fetchOrLoadData = async (ticker: string) => {
    const fileName = `${ticker}.json`
    const filePath = path.resolve(__dirname, fileName)
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath).toString())
    } else {
        const queryOptions = { period1: '2020-01-01' };
        const result = await yahooFinance.historical(ticker, queryOptions);
        fs.writeFileSync(filePath, JSON.stringify(result, null, 2))
        return result
    }
}

const calculate = async (data: HistoricalHistoryResult, { baseAsset, quoteAsset }: { baseAsset: string, quoteAsset: string }) => {
    const investAmount = 10

    let bank = new BigNumber(0)
    let totalInvested = new BigNumber(0)
    let count = 0
    for (const row of data) {

        const date = row.date
        const buyAt = row.close
        const amountToBuyAsset = new BigNumber(1).dividedBy(buyAt).multipliedBy(investAmount)

        // console.log(row, amountToBuyAsset.toString())
        bank = bank.plus(amountToBuyAsset)
        totalInvested = totalInvested.plus(investAmount)
        count++
        const currentPrice = row.close
        const currentBankPrice = bank.multipliedBy(row.close)

        const profit = currentBankPrice.multipliedBy(100).dividedBy(totalInvested).minus(100)

        console.log(date, `buy at : ${buyAt.toFixed(2)} , bank ${bank.toFixed(4)} ${baseAsset} (${currentBankPrice.toFixed(4)} ${quoteAsset}) , total invested ${totalInvested} ${quoteAsset}, current price ${currentPrice}, profit ${profit.toFixed(2)}% `)
    }

}

async function main() {
    const baseAsset = 'BTC'
    const quoteAsset = 'USD'
    const query = `${baseAsset}-${quoteAsset}`
    const data = await fetchOrLoadData(query)
    await calculate(data, { baseAsset, quoteAsset })
}


main()