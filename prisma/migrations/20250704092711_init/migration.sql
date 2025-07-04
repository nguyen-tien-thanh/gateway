-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'PENDING') NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `tokenValidityDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `salt` VARCHAR(191) NOT NULL,
    `twoFASecret` VARCHAR(191) NULL,
    `twoFAThrottleTime` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isTwoFAEnabled` BOOLEAN NOT NULL DEFAULT false,
    `roleId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ext` INTEGER NULL,

    UNIQUE INDEX `user_username_key`(`username`),
    UNIQUE INDEX `user_email_key`(`email`),
    INDEX `user_username_idx`(`username`),
    INDEX `user_email_idx`(`email`),
    INDEX `user_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `role_name_key`(`name`),
    INDEX `role_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `resource` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL DEFAULT 'GET',
    `isDefault` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `permission_description_idx`(`description`),
    UNIQUE INDEX `permission_resource_description_key`(`resource`, `description`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleId` INTEGER NOT NULL,
    `permissionId` INTEGER NOT NULL,

    UNIQUE INDEX `role_permission_roleId_permissionId_key`(`roleId`, `permissionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `ip` VARCHAR(191) NOT NULL,
    `userAgent` TEXT NOT NULL,
    `browser` VARCHAR(191) NULL,
    `os` VARCHAR(191) NULL,
    `isRevoked` BOOLEAN NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    INDEX `refresh_token_browser_idx`(`browser`),
    INDEX `refresh_token_os_idx`(`os`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_template` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `sender` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `email_template_title_key`(`title`),
    UNIQUE INDEX `email_template_slug_key`(`slug`),
    INDEX `email_template_title_idx`(`title`),
    INDEX `email_template_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `call_call` (
    `id` INTEGER NOT NULL,
    `hotline` VARCHAR(191) NULL,
    `ext` INTEGER NULL,
    `callStartTime` DATETIME(3) NOT NULL,
    `callDuration` INTEGER NULL,
    `url` VARCHAR(191) NULL,
    `createdDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` INTEGER NOT NULL,
    `updatedDate` DATETIME(3) NOT NULL,
    `transcriptionId` INTEGER NULL,
    `crmId` INTEGER NULL,
    `summaryId` INTEGER NULL,
    `statusId` INTEGER NULL,
    `callTypeId` INTEGER NULL,
    `queueId` INTEGER NULL,
    `unitId` INTEGER NULL,

    UNIQUE INDEX `call_call_id_key`(`id`),
    UNIQUE INDEX `call_call_transcriptionId_key`(`transcriptionId`),
    UNIQUE INDEX `call_call_crmId_key`(`crmId`),
    UNIQUE INDEX `call_call_summaryId_key`(`summaryId`),
    UNIQUE INDEX `call_call_queueId_key`(`queueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `call_unit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `call_transcription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `callId` INTEGER NOT NULL,
    `transcription` VARCHAR(191) NULL,
    `transcriptionMarked` JSON NULL,

    UNIQUE INDEX `call_transcription_callId_key`(`callId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `call_summary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `callId` INTEGER NOT NULL,
    `steps` JSON NULL,
    `callTopic` VARCHAR(191) NULL,
    `callSummary` VARCHAR(191) NULL,
    `productCategory` VARCHAR(191) NULL,
    `productName` VARCHAR(191) NULL,
    `agentAttitude` INTEGER NULL,
    `agentOverallScore` INTEGER NULL,
    `custSentiment` INTEGER NULL,
    `custExperience` INTEGER NULL,
    `overallOutcome` VARCHAR(191) NULL,

    UNIQUE INDEX `call_summary_callId_key`(`callId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `call_status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `call_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `call_queue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `callId` INTEGER NOT NULL,
    `quanlyxe` JSON NULL,
    `crm` JSON NULL,
    `plate` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `createdDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` INTEGER NOT NULL,
    `updatedDate` DATETIME(3) NOT NULL,

    UNIQUE INDEX `call_queue_callId_key`(`callId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_token` ADD CONSTRAINT `refresh_token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `call_call` ADD CONSTRAINT `call_call_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `call_status`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `call_call` ADD CONSTRAINT `call_call_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `call_call` ADD CONSTRAINT `call_call_callTypeId_fkey` FOREIGN KEY (`callTypeId`) REFERENCES `call_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `call_call` ADD CONSTRAINT `call_call_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `call_unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `call_transcription` ADD CONSTRAINT `call_transcription_callId_fkey` FOREIGN KEY (`callId`) REFERENCES `call_call`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `call_summary` ADD CONSTRAINT `call_summary_callId_fkey` FOREIGN KEY (`callId`) REFERENCES `call_call`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `call_queue` ADD CONSTRAINT `call_queue_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `call_queue` ADD CONSTRAINT `call_queue_callId_fkey` FOREIGN KEY (`callId`) REFERENCES `call_call`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
