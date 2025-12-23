// routes/admin.ts
import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.delete("/delete_all", async (req, res) => {
  try {
    const collections = Object.keys(mongoose.connection.collections);

    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName];
      await collection.deleteMany({}); // delete all documents
    }

    return res.status(200).json({ message: "All collections cleared successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error clearing database", error: err });
  }
});

export default router;
