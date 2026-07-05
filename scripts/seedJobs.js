require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const CommitJob = require('../models/CommitJob');

// "HIRE ME" draw karne wali exact dates (Monday-Friday blocks)
const hireMeDates = [
  // H
  "2025-12-29", "2025-12-30", "2025-12-31", "2026-01-01", "2026-01-02",
  "2026-01-07",
  "2026-01-12", "2026-01-13", "2026-01-14", "2026-01-15", "2026-01-16",
  // I
  "2026-01-26", "2026-01-30",
  "2026-02-02", "2026-02-03", "2026-02-04", "2026-02-05", "2026-02-06",
  "2026-02-09", "2026-02-13",
  // R
  "2026-02-23", "2026-02-24", "2026-02-25", "2026-02-26", "2026-02-27",
  "2026-03-02", "2026-03-04",
  "2026-03-09", "2026-03-11", "2026-03-12",
  "2026-03-17", "2026-03-20",
  // E
  "2026-03-30", "2026-03-31", "2026-04-01", "2026-04-02", "2026-04-03",
  "2026-04-06", "2026-04-08", "2026-04-10",
  "2026-04-13", "2026-04-15", "2026-04-17",
  // M
  "2026-05-04", "2026-05-05", "2026-05-06", "2026-05-07", "2026-05-08",
  "2026-05-12",
  "2026-05-20",
  "2026-05-26",
  "2026-06-01", "2026-06-02", "2026-06-03", "2026-06-04", "2026-06-05",
  // E
  "2026-06-15", "2026-06-16", "2026-06-17", "2026-06-18", "2026-06-19",
  "2026-06-22", "2026-06-24", "2026-06-26",
  "2026-06-29", "2026-07-01", "2026-07-03"
];

async function seedDatabase() {
  try {
    await connectDB();

    console.log('🧹 Purane jobs clear kar rahe hain...');
    await CommitJob.deleteMany({});
    console.log('✨ Database clean ho gaya!');

    const jobsToInsert = [];

    // Har din ke liye 4 commits generate karenge
    hireMeDates.forEach((dateString) => {
      for (let i = 1; i <= 4; i++) {
        // Exact time set kar rahe hain (e.g., 12:01:00, 12:02:00)
        const timeString = `12:0${i}:00Z`;
        const fullDate = `${dateString}T${timeString}`;

        jobsToInsert.push({
          date: fullDate,
          message: `chore: contribution graph automation [${dateString} #${i}]`,
          status: 'PENDING',
          retryCount: 0
        });
      }
    });

    console.log(`⏳ Total ${jobsToInsert.length} commit jobs insert ho rahe hain...`);
    await CommitJob.insertMany(jobsToInsert);

    console.log(`✅ Success! ${jobsToInsert.length} jobs successfully database me add ho gaye!`);
    console.log('👉 Ab aap "npm start" chala kar automation shuru kar sakte ho.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding me error aaya:', error);
    process.exit(1);
  }
}

seedDatabase();
