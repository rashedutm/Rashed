-- AlterTable
ALTER TABLE `profile` ADD COLUMN `availabilitySize` VARCHAR(8) NOT NULL DEFAULT 'md';

-- AlterTable
ALTER TABLE `skill` ADD COLUMN `heroHighlight` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Skill_heroHighlight_idx` ON `Skill`(`heroHighlight`);
