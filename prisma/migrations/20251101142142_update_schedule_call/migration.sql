-- CreateTable
CREATE TABLE "ScheduledCall" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "recipientName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "inngestEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduledCallId" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "recipientName" TEXT,
    "status" TEXT NOT NULL,
    "duration" INTEGER,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "recordingUrl" TEXT,
    "transcript" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduledCall_userId_idx" ON "ScheduledCall"("userId");

-- CreateIndex
CREATE INDEX "ScheduledCall_scheduledTime_idx" ON "ScheduledCall"("scheduledTime");

-- CreateIndex
CREATE INDEX "ScheduledCall_status_idx" ON "ScheduledCall"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CallLog_scheduledCallId_key" ON "CallLog"("scheduledCallId");

-- CreateIndex
CREATE INDEX "CallLog_userId_idx" ON "CallLog"("userId");

-- CreateIndex
CREATE INDEX "CallLog_status_idx" ON "CallLog"("status");

-- CreateIndex
CREATE INDEX "CallLog_createdAt_idx" ON "CallLog"("createdAt");

-- AddForeignKey
ALTER TABLE "ScheduledCall" ADD CONSTRAINT "ScheduledCall_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallLog" ADD CONSTRAINT "CallLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallLog" ADD CONSTRAINT "CallLog_scheduledCallId_fkey" FOREIGN KEY ("scheduledCallId") REFERENCES "ScheduledCall"("id") ON DELETE SET NULL ON UPDATE CASCADE;
