-- CreateTable
CREATE TABLE "email_template" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_template_title_key" ON "email_template"("title");

-- CreateIndex
CREATE UNIQUE INDEX "email_template_slug_key" ON "email_template"("slug");

-- CreateIndex
CREATE INDEX "email_template_title_idx" ON "email_template"("title");

-- CreateIndex
CREATE INDEX "email_template_slug_idx" ON "email_template"("slug");
