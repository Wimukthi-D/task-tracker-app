-- CreateTable
CREATE TABLE `AuthSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `selector` VARCHAR(191) NOT NULL,
    `refreshTokenHash` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `userAgent` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AuthSession_selector_key`(`selector`),
    UNIQUE INDEX `AuthSession_refreshTokenHash_key`(`refreshTokenHash`),
    INDEX `AuthSession_userId_idx`(`userId`),
    INDEX `AuthSession_selector_idx`(`selector`),
    INDEX `AuthSession_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AuthSession` ADD CONSTRAINT `AuthSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
