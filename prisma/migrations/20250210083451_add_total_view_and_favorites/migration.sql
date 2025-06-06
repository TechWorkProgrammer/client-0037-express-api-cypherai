-- AlterTable
ALTER TABLE `Mesh` ADD COLUMN `totalView` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Music` ADD COLUMN `totalView` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Favorite` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `meshId` VARCHAR(100) NULL,
    `musicId` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Favorite_userId_meshId_key`(`userId`, `meshId`),
    UNIQUE INDEX `Favorite_userId_musicId_key`(`userId`, `musicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_meshId_fkey` FOREIGN KEY (`meshId`) REFERENCES `Mesh`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_musicId_fkey` FOREIGN KEY (`musicId`) REFERENCES `Music`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
