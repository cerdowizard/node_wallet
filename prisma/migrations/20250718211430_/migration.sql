/*
  Warnings:

  - A unique constraint covering the columns `[walletAddress]` on the table `wallets` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "walletAddress" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "wallets_walletAddress_key" ON "wallets"("walletAddress");
