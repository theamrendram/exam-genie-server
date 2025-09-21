import { RequestHandler } from "express";
import { Webhook } from "svix";
import prisma from "../utils/prisma-client";

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    created_at: number;
    updated_at: number;
  };
}

// Handle Clerk webhook events
const handleWebhook: RequestHandler = async (req, res) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    // Get the headers
    const svix_id = req.headers["svix-id"] as string;
    const svix_timestamp = req.headers["svix-timestamp"] as string;
    const svix_signature = req.headers["svix-signature"] as string;

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: "Missing svix headers" });
    }

    // Get the body
    const payload = JSON.stringify(req.body);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: ClerkWebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    // Handle the webhook
    const { type, data } = evt;

    console.log(`Webhook received: ${type}`);

    switch (type) {
      case "user.created":
        await handleUserCreated(data);
        break;
      case "user.updated":
        await handleUserUpdated(data);
        break;
      case "user.deleted":
        await handleUserDeleted(data);
        break;
      default:
        console.log(`Unhandled webhook event type: ${type}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Handle user creation
async function handleUserCreated(data: ClerkWebhookEvent["data"]) {
  try {
    const email = data.email_addresses[0]?.email_address;

    if (!email) {
      console.error("No email found in user data");
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`User with email ${email} already exists`);
      return;
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        name:
          data.first_name && data.last_name
            ? `${data.first_name} ${data.last_name}`
            : data.first_name || data.last_name || null,
        imageUrl: data.image_url || null,
        role: "USER", // Default role
      },
    });

    console.log(`User created successfully: ${user.email}`);
  } catch (error) {
    console.error("Error creating user from webhook:", error);
  }
}

// Handle user updates
async function handleUserUpdated(data: ClerkWebhookEvent["data"]) {
  try {
    const email = data.email_addresses[0]?.email_address;

    if (!email) {
      console.error("No email found in user data");
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`User with email ${email} not found for update`);
      return;
    }

    // Update user in database
    await prisma.user.update({
      where: { email },
      data: {
        name:
          data.first_name && data.last_name
            ? `${data.first_name} ${data.last_name}`
            : data.first_name || data.last_name || user.name,
        imageUrl: data.image_url || user.imageUrl,
      },
    });

    console.log(`User updated successfully: ${email}`);
  } catch (error) {
    console.error("Error updating user from webhook:", error);
  }
}

// Handle user deletion
async function handleUserDeleted(data: ClerkWebhookEvent["data"]) {
  try {
    const email = data.email_addresses[0]?.email_address;

    if (!email) {
      console.error("No email found in user data");
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`User with email ${email} not found for deletion`);
      return;
    }

    // Delete user from database
    await prisma.user.delete({
      where: { email },
    });

    console.log(`User deleted successfully: ${email}`);
  } catch (error) {
    console.error("Error deleting user from webhook:", error);
  }
}

export { handleWebhook };
