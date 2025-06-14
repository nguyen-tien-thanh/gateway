/*
  Warnings:

  - A unique constraint covering the columns `[resource,description]` on the table `permission` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `permission_description_key` ON `permission`;

-- AlterTable
ALTER TABLE `permission` MODIFY `isDefault` BOOLEAN NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `permission_resource_description_key` ON `permission`(`resource`, `description`);
