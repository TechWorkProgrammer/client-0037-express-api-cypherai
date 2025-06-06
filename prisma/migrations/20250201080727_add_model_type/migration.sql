/*
  Warnings:

  - Added the required column `modelType` to the `Mesh` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Mesh` ADD COLUMN `modelType` VARCHAR(191) NOT NULL;
