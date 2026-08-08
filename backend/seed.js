const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const User = require("./Models/User");
const Contact = require("./Models/Contact");

const sampleContacts = [
  {
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    phone: "+1-555-0101",
    address: "123 Maple Street, New York, NY"
  },
  {
    name: "Sophia Chen",
    email: "sophia.chen@example.com",
    phone: "+1-555-0102",
    address: "456 Oak Avenue, San Francisco, CA"
  },
  {
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91-98765-43210",
    address: "12 MG Road, Bangalore, KA"
  },
  {
    name: "Emily Watson",
    email: "emily.watson@example.com",
    phone: "+1-555-0104",
    address: "789 Pine Lane, Seattle, WA"
  },
  {
    name: "Liam Johnson",
    email: "liam.johnson@example.com",
    phone: "+1-555-0105",
    address: "321 Elm Boulevard, Chicago, IL"
  },
  {
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+91-98123-45678",
    address: "88 Anna Salai, Chennai, TN"
  },
  {
    name: "Carlos Rodriguez",
    email: "carlos.r@example.com",
    phone: "+1-555-0107",
    address: "654 Cedar Drive, Austin, TX"
  },
  {
    name: "Jessica Taylor",
    email: "jessica.t@example.com",
    phone: "+1-555-0108",
    address: "987 Birch Court, Denver, CO"
  },
  {
    name: "Arjun Reddy",
    email: "arjun.reddy@example.com",
    phone: "+91-97000-11223",
    address: "45 Jubilee Hills, Hyderabad, TS"
  },
  {
    name: "Hannah Miller",
    email: "hannah.m@example.com",
    phone: "+1-555-0110",
    address: "147 Sunset Blvd, Los Angeles, CA"
  },
  {
    name: "David Smith",
    email: "david.smith@example.com",
    phone: "+1-555-0111",
    address: "258 River Road, Boston, MA"
  },
  {
    name: "Sneha Kapoor",
    email: "sneha.k@example.com",
    phone: "+91-99887-76655",
    address: "33 Connaught Place, New Delhi, DL"
  },
  {
    name: "Oliver Brown",
    email: "oliver.b@example.com",
    phone: "+1-555-0113",
    address: "369 Walnut Street, Miami, FL"
  },
  {
    name: "Ananya Verma",
    email: "ananya.v@example.com",
    phone: "+91-96543-21098",
    address: "77 Park Street, Kolkata, WB"
  },
  {
    name: "Ethan Davis",
    email: "ethan.d@example.com",
    phone: "+1-555-0115",
    address: "741 Lakeview Ave, Minneapolis, MN"
  },
  {
    name: "Chloe Wilson",
    email: "chloe.w@example.com",
    phone: "+1-555-0116",
    address: "852 Hillside Drive, Portland, OR"
  },
  {
    name: "Vikram Malhotra",
    email: "vikram.m@example.com",
    phone: "+91-98760-12345",
    address: "55 Marine Drive, Mumbai, MH"
  },
  {
    name: "Mia Anderson",
    email: "mia.a@example.com",
    phone: "+1-555-0118",
    address: "963 Magnolia Way, Atlanta, GA"
  },
  {
    name: "Noah Thomas",
    email: "noah.t@example.com",
    phone: "+1-555-0119",
    address: "159 Spruce Street, Dallas, TX"
  },
  {
    name: "Kavya Sundaram",
    email: "kavya.s@example.com",
    phone: "+91-94444-55555",
    address: "21 RS Puram, Coimbatore, TN"
  }
];

async function seedData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected successfully.");

    let users = await User.find({});
    if (users.length === 0) {
      console.log("No users found. Creating a default user...");
      const defaultUser = new User({
        name: "Harish",
        mail: "harish@gmail.com",
        password: "1"
      });
      await defaultUser.save();
      users = [defaultUser];
    }

    console.log(`Found ${users.length} user(s) in database.`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < sampleContacts.length; i++) {
      const contactData = sampleContacts[i];
      // Assign contacts round-robin among existing users
      const assignedUser = users[i % users.length];

      const existingContact = await Contact.findOne({
        $or: [
          { email: contactData.email },
          { phone: contactData.phone }
        ]
      });

      if (existingContact) {
        skippedCount++;
        continue;
      }

      const newContact = new Contact({
        ...contactData,
        userId: assignedUser._id.toString()
      });

      await newContact.save();
      insertedCount++;
      console.log(`[${i + 1}/20] Inserted contact: ${newContact.name} -> assigned to user: ${assignedUser.mail}`);
    }

    console.log("\n=================================");
    console.log(`Seeding Completed!`);
    console.log(`Inserted: ${insertedCount} contacts`);
    console.log(`Skipped (already exists): ${skippedCount} contacts`);
    console.log("=================================\n");

  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB Disconnected.");
    process.exit(0);
  }
}

seedData();
